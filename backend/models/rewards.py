from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from database.db import Base


class CashRewardConfig(Base):
    """
    Global admin-controlled reward rates for academic actions.
    """
    __tablename__ = "cash_reward_configs"

    id = Column(Integer, primary_key=True, index=True)
    assignment_cash = Column(Integer, default=50)     # Cash awarded on assignment submission
    exam_cash = Column(Integer, default=100)           # Cash awarded on exam completion
    high_score_cash = Column(Integer, default=50)      # Bonus cash for score >= 90%
    streak_cash = Column(Integer, default=10)          # Daily study streak reward
    note_upload_cash = Column(Integer, default=25)     # Cash for publishing useful study notes
    updated_at = Column(DateTime, default=datetime.utcnow)


class CashTransaction(Base):
    """
    Ledger of CASH earnings and CASHMART purchases.
    """
    __tablename__ = "cash_transactions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)  # Student.id
    user_id = Column(Integer, nullable=True)                  # User.id
    amount = Column(Integer, nullable=False)                  # Positive for earned, negative for spent
    transaction_type = Column(String, nullable=False)         # "assignment" | "exam" | "streak" | "admin_grant" | "purchase" | "refund"
    description = Column(String, nullable=False)
    reference_id = Column(Integer, nullable=True)             # e.g. assignment_id or exam_id or order_id
    created_at = Column(DateTime, default=datetime.utcnow)


class CashMartItem(Base):
    """
    Real-world gift or digital privilege redeemable in CASHMART.
    """
    __tablename__ = "cashmart_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, default="Chocolates & Treats")  # Chocolates | Stationery | Passes | Collectibles
    cash_price = Column(Integer, nullable=False, default=150)
    image_url = Column(String, nullable=True)
    stock = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CashMartOrder(Base):
    """
    Student gift redemption order.
    """
    __tablename__ = "cashmart_orders"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    student_name = Column(String, nullable=False)
    item_id = Column(Integer, ForeignKey("cashmart_items.id"), nullable=False)
    item_title = Column(String, nullable=False)
    item_image = Column(String, nullable=True)
    cash_paid = Column(Integer, nullable=False)
    status = Column(String, default="Pending")               # Pending | Approved | Fulfilled | Cancelled
    delivery_notes = Column(Text, nullable=True)
    ordered_at = Column(DateTime, default=datetime.utcnow)
    fulfilled_at = Column(DateTime, nullable=True)
