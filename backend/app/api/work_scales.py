import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.all_models import WorkScale, User, Group
from app.schemas.all_schemas import WorkScaleCreate, WorkScaleResponse
from app.api.auth import get_current_user, RoleChecker
from app.services.audit_service import log_action

router = APIRouter(prefix="/work-scales", tags=["work-scales"])

check_hr_manager = RoleChecker(["rh", "admin", "admin_delegado"], required_permission="has_hr_access")

@router.get("", response_model=List[WorkScaleResponse])
def list_work_scales(
    group_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WorkScale)
    if current_user.role != "admin":
        query = query.filter(WorkScale.group_id == current_user.group_id)
    elif group_id:
        query = query.filter(WorkScale.group_id == group_id)
        
    return query.order_by(WorkScale.name.asc()).all()

@router.post("", response_model=WorkScaleResponse, status_code=status.HTTP_201_CREATED)
def create_work_scale(
    scale_in: WorkScaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_hr_manager)
):
    if current_user.role == "admin":
        first_group = db.query(Group).first()
        group_id_to_set = first_group.id if first_group else None
    else:
        group_id_to_set = current_user.group_id

    # Check duplicate in the same tenant group
    existing = db.query(WorkScale).filter(
        WorkScale.name == scale_in.name,
        WorkScale.group_id == group_id_to_set
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Já existe uma escala cadastrada com este nome nesta empresa."
        )

    db_scale = WorkScale(
        group_id=group_id_to_set,
        name=scale_in.name,
        description=scale_in.description,
        entry_time=scale_in.entry_time,
        exit_time=scale_in.exit_time,
        interval_minutes=scale_in.interval_minutes,
        is_active=scale_in.is_active,
        created_by=current_user.username,
        updated_by=current_user.username
    )
    db.add(db_scale)
    db.commit()
    db.refresh(db_scale)

    log_action(db, current_user.id, "CREATE_WORK_SCALE", "work_scales", db_scale.id, {"name": db_scale.name})
    return db_scale

@router.put("/{scale_id}", response_model=WorkScaleResponse)
def update_work_scale(
    scale_id: str,
    scale_in: WorkScaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_hr_manager)
):
    db_scale = db.query(WorkScale).filter(WorkScale.id == scale_id).first()
    if not db_scale:
        raise HTTPException(status_code=404, detail="Escala não encontrada.")
    
    if current_user.role != "admin" and db_scale.group_id != current_user.group_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar dados desta empresa.")

    db_scale.name = scale_in.name
    db_scale.description = scale_in.description
    db_scale.entry_time = scale_in.entry_time
    db_scale.exit_time = scale_in.exit_time
    db_scale.interval_minutes = scale_in.interval_minutes
    db_scale.is_active = scale_in.is_active
    db_scale.updated_at = datetime.utcnow()
    db_scale.updated_by = current_user.username
    
    db.commit()
    db.refresh(db_scale)

    log_action(db, current_user.id, "UPDATE_WORK_SCALE", "work_scales", db_scale.id, {"name": db_scale.name})
    return db_scale

@router.delete("/{scale_id}", status_code=status.HTTP_200_OK)
def delete_work_scale(
    scale_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_hr_manager)
):
    db_scale = db.query(WorkScale).filter(WorkScale.id == scale_id).first()
    if not db_scale:
        raise HTTPException(status_code=404, detail="Escala não encontrada.")
    
    if current_user.role != "admin" and db_scale.group_id != current_user.group_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar dados desta empresa.")

    db.delete(db_scale)
    db.commit()

    log_action(db, current_user.id, "DELETE_WORK_SCALE", "work_scales", scale_id)
    return {"message": "Escala excluída com sucesso."}
