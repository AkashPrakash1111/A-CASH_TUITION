from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Student
from models.rewards import CashRewardConfig, CashTransaction, CashMartItem, CashMartOrder
from models.user import User, UserRole
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/rewards", tags=["rewards"])


# ---- Schemas ----

class RewardConfigUpdate(BaseModel):
    assignment_cash: int = 50
    exam_cash: int = 100
    high_score_cash: int = 50
    streak_cash: int = 10
    note_upload_cash: int = 25


class AdminGrantCash(BaseModel):
    student_id: int
    amount: int
    description: str = "Faculty Bonus Award"


class CashMartItemCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str = "Chocolates & Treats"
    cash_price: int = 150
    image_url: Optional[str] = None
    stock: int = 50
    is_active: bool = True


class PurchaseRequest(BaseModel):
    item_id: int
    delivery_notes: Optional[str] = ""


class OrderStatusUpdate(BaseModel):
    status: str  # Pending | Approved | Delivered | Cancelled
    delivery_notes: Optional[str] = None


# ---- Helper Functions ----

def get_or_create_config(db: Session) -> CashRewardConfig:
    config = db.query(CashRewardConfig).first()
    if not config:
        config = CashRewardConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def award_student_cash(
    db: Session,
    student_id: int,
    amount: int,
    trans_type: str,
    description: str,
    reference_id: Optional[int] = None,
    user_id: Optional[int] = None,
) -> int:
    """
    Credits or debits CASH to a student, creates a transaction record,
    and returns updated balance.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return 0

    current_balance = student.cash_balance if student.cash_balance is not None else 100
    new_balance = max(0, current_balance + amount)
    student.cash_balance = new_balance

    tx = CashTransaction(
        student_id=student_id,
        user_id=user_id or student.user_id,
        amount=amount,
        transaction_type=trans_type,
        description=description,
        reference_id=reference_id,
        created_at=datetime.utcnow(),
    )
    db.add(tx)
    db.commit()
    return new_balance


RANKS = [
    (0, "Silver Apprentice"),
    (250, "Gold Pioneer"),
    (500, "Diamond Scholar"),
    (1000, "Master Luminary"),
]


def rank_for(balance: int) -> dict:
    """Current rank plus how far the next one is."""
    idx = max(i for i, (floor, _) in enumerate(RANKS) if balance >= floor)
    nxt = RANKS[idx + 1] if idx + 1 < len(RANKS) else None
    return {
        "rank": RANKS[idx][1],
        "next_rank": nxt[1] if nxt else None,
        "next_rank_at": nxt[0] if nxt else None,
    }


def cash_totals(db: Session, student_id: int) -> tuple[int, int]:
    """(lifetime earned, net spent) over the WHOLE ledger. A refund is money
    handed back, not money earned, so it reduces 'spent' instead."""
    q = db.query(func.coalesce(func.sum(CashTransaction.amount), 0)).filter(
        CashTransaction.student_id == student_id
    )
    earned = q.filter(CashTransaction.amount > 0, CashTransaction.transaction_type != "refund").scalar()
    spent = q.filter(CashTransaction.transaction_type.in_(("purchase", "refund"))).scalar()
    return int(earned), int(max(0, -spent))


# ---- Endpoints ----

@router.get("/config")
def get_reward_config(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return get_or_create_config(db)


@router.put("/config")
def update_reward_config(
    payload: RewardConfigUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin)),
):
    config = get_or_create_config(db)
    config.assignment_cash = payload.assignment_cash
    config.exam_cash = payload.exam_cash
    config.high_score_cash = payload.high_score_cash
    config.streak_cash = payload.streak_cash
    config.note_upload_cash = payload.note_upload_cash
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config


@router.get("/balance")
def get_my_cash_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter_by(user_id=current_user.id).first()
    if not student:
        return {
            "cash_balance": 100,
            "total_earned": 100,
            "student_name": current_user.name,
            "rank": "Cadet Scholar",
        }

    balance = student.cash_balance if student.cash_balance is not None else 100
    txs = (
        db.query(CashTransaction)
        .filter_by(student_id=student.id)
        .order_by(CashTransaction.created_at.desc())
        .limit(15)
        .all()
    )

    total_earned, total_spent = cash_totals(db, student.id)
    rank = rank_for(balance)["rank"]

    return {
        "cash_balance": balance,
        "total_earned": total_earned,
        "student_name": student.name,
        "student_id": student.id,
        "className": student.className,
        "batch": student.batch,
        "total_spent": total_spent,
        "rank": rank,
        "recent_transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "type": t.transaction_type,
                "description": t.description,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in txs
        ],
    }


@router.post("/admin/grant")
def admin_grant_cash(
    payload: AdminGrantCash,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_bal = award_student_cash(
        db=db,
        student_id=student.id,
        amount=payload.amount,
        trans_type="admin_grant",
        description=payload.description or f"Granted by {admin.name}",
        user_id=student.user_id,
    )
    return {
        "success": True,
        "student_id": student.id,
        "student_name": student.name,
        "new_balance": new_bal,
        "amount_granted": payload.amount,
    }


# ---- CASHMART Catalog & Orders ----

@router.get("/items")
def list_cashmart_items(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    query = db.query(CashMartItem).filter(CashMartItem.is_active == True)
    if category and category != "all":
        query = query.filter(CashMartItem.category == category)
    items = query.order_by(CashMartItem.cash_price.asc()).all()

    # If database has zero items yet, seed default attractive real-world gifts!
    if len(items) == 0 and not category:
        seed_items = [
            CashMartItem(
                title="Cadbury Dairy Milk Silk (Heart Pop)",
                description="Delicious creamy chocolate treat delivered to your desk or home.",
                category="Chocolates & Treats",
                cash_price=150,
                image_url="https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop&q=80",
                stock=50,
            ),
            CashMartItem(
                title="Ferrero Rocher Golden Gift Box (4 Pcs)",
                description="Premium hazelnut crisp chocolates for star learners.",
                category="Chocolates & Treats",
                cash_price=250,
                image_url="https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&auto=format&fit=crop&q=80",
                stock=40,
            ),
            CashMartItem(
                title="Futuristic Neon Gel Pens (Set of 6)",
                description="Smooth high-precision ink pens with glowing metallic accents.",
                category="Stationery",
                cash_price=180,
                image_url="https://images.unsplash.com/photo-1585336261026-6b2165fa44b3?w=400&auto=format&fit=crop&q=80",
                stock=35,
            ),
            CashMartItem(
                title="Cosmic Galaxy Hardcover Journal",
                description="Matte finish 200-page notebook for equations and creative notes.",
                category="Stationery",
                cash_price=220,
                image_url="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
                stock=25,
            ),
            CashMartItem(
                title="Digital Campus 1-Day Homework Grace Pass",
                description="Official ACASH voucher extending an assignment due date by 24 hours.",
                category="Privileges & Passes",
                cash_price=350,
                image_url="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80",
                stock=100,
            ),
            CashMartItem(
                title="Roblox / Minecraft Digital Voucher (₹250)",
                description="Redeemable game card code sent directly to your student message box.",
                category="Collectibles",
                cash_price=600,
                image_url="https://images.unsplash.com/photo-1612287232230-e847c2a71bf0?w=400&auto=format&fit=crop&q=80",
                stock=20,
            ),
            CashMartItem(
                title="ACASH Celestial Hologram Badge & Pin",
                description="Exclusive physical collectible badge shipped for high-ranking scholars.",
                category="Collectibles",
                cash_price=120,
                image_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
                stock=60,
            ),
        ]
        db.add_all(seed_items)
        db.commit()
        items = db.query(CashMartItem).filter(CashMartItem.is_active == True).all()

    return items


@router.post("/items")
def create_cashmart_item(
    payload: CashMartItemCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin)),
):
    item = CashMartItem(
        title=payload.title,
        description=payload.description or "",
        category=payload.category,
        cash_price=payload.cash_price,
        image_url=payload.image_url,
        stock=payload.stock,
        is_active=payload.is_active,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/items/{item_id}")
def update_cashmart_item(
    item_id: int,
    payload: CashMartItemCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin)),
):
    item = db.query(CashMartItem).filter(CashMartItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for k, v in payload.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{item_id}")
def delete_cashmart_item(
    item_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin)),
):
    item = db.query(CashMartItem).filter(CashMartItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.is_active = False
    db.commit()
    return {"success": True, "message": "Item deactivated"}


@router.post("/purchase")
def purchase_cashmart_item(
    payload: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    student = db.query(Student).filter_by(user_id=current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student roster profile not found")

    item = db.query(CashMartItem).filter(CashMartItem.id == payload.item_id).first()
    if not item or not item.is_active:
        raise HTTPException(status_code=404, detail="Item is not available")

    if item.stock <= 0:
        raise HTTPException(status_code=400, detail="This gift is currently out of stock!")

    current_balance = student.cash_balance if student.cash_balance is not None else 100
    if current_balance < item.cash_price:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient CASH! You have {current_balance} CASH, but this item costs {item.cash_price} CASH. Complete more assignments and exams to earn CASH!",
        )

    # Deduct CASH
    student.cash_balance = current_balance - item.cash_price
    item.stock -= 1

    # Record Transaction
    tx = CashTransaction(
        student_id=student.id,
        user_id=current_user.id,
        amount=-item.cash_price,
        transaction_type="purchase",
        description=f"Redeemed: {item.title}",
        reference_id=item.id,
        created_at=datetime.utcnow(),
    )
    db.add(tx)

    # Create Order
    order = CashMartOrder(
        student_id=student.id,
        student_name=student.name,
        item_id=item.id,
        item_title=item.title,
        item_image=item.image_url,
        cash_paid=item.cash_price,
        status="Pending",
        delivery_notes=payload.delivery_notes or "In-campus desk handover",
        ordered_at=datetime.utcnow(),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": f"🎉 Congratulations! You have redeemed {item.title}!",
        "new_balance": student.cash_balance,
        "order_id": order.id,
        "item_title": item.title,
    }


@router.get("/orders/my-orders")
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    student = db.query(Student).filter_by(user_id=current_user.id).first()
    if not student:
        return []

    return (
        db.query(CashMartOrder)
        .filter_by(student_id=student.id)
        .order_by(CashMartOrder.ordered_at.desc())
        .all()
    )


@router.get("/orders/all")
def list_all_orders(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    return (
        db.query(CashMartOrder)
        .order_by(CashMartOrder.ordered_at.desc())
        .all()
    )


@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin)),
):
    order = db.query(CashMartOrder).filter(CashMartOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    order.status = payload.status
    if payload.delivery_notes is not None:
        order.delivery_notes = payload.delivery_notes

    if payload.status == "Delivered":
        order.fulfilled_at = datetime.utcnow()

    # If admin cancels, refund CASH to student
    if payload.status == "Cancelled" and old_status != "Cancelled":
        student = db.query(Student).filter(Student.id == order.student_id).first()
        if student:
            student.cash_balance = (student.cash_balance or 0) + order.cash_paid
            tx = CashTransaction(
                student_id=student.id,
                user_id=student.user_id,
                amount=order.cash_paid,
                transaction_type="refund",
                description=f"Refund: {order.item_title} (Order #{order.id} Cancelled)",
                reference_id=order.id,
                created_at=datetime.utcnow(),
            )
            db.add(tx)

    db.commit()
    db.refresh(order)
    return order
