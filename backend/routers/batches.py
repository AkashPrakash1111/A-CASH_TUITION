from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Batch
from models.user import UserRole
from schemas.academic import BatchCreate, BatchOut
from utils.deps import require_role

router = APIRouter(prefix="/batches", tags=["batches"])


@router.get("", response_model=list[BatchOut])
def list_batches(db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    return db.query(Batch).order_by(Batch.created_at.desc()).all()


@router.post("", response_model=BatchOut, status_code=201)
def create_batch(payload: BatchCreate, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    batch = Batch(**payload.model_dump())
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.put("/{batch_id}", response_model=BatchOut)
def update_batch(batch_id: int, payload: BatchCreate, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    for key, value in payload.model_dump().items():
        setattr(batch, key, value)

    db.commit()
    db.refresh(batch)
    return batch


@router.delete("/{batch_id}", status_code=204)
def delete_batch(batch_id: int, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    db.delete(batch)
    db.commit()
