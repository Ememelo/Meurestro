import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.all_models import JobPosition, Sector, User, Group
from app.schemas.all_schemas import JobPositionCreate, JobPositionResponse
from app.api.auth import get_current_user, RoleChecker
from app.services.audit_service import log_action

router = APIRouter(prefix="/job-positions", tags=["job-positions"])

check_hr_manager = RoleChecker(["rh", "admin", "admin_delegado"], required_permission="has_hr_access")

@router.get("", response_model=List[JobPositionResponse])
def list_job_positions(
    group_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(JobPosition)
    if current_user.role != "admin":
        query = query.filter(JobPosition.group_id == current_user.group_id)
    elif group_id:
        query = query.filter(JobPosition.group_id == group_id)
        
    return query.order_by(JobPosition.name.asc()).all()

@router.post("", response_model=JobPositionResponse, status_code=status.HTTP_201_CREATED)
def create_job_position(
    job_in: JobPositionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_hr_manager)
):
    if current_user.role == "admin":
        first_group = db.query(Group).first()
        group_id_to_set = first_group.id if first_group else None
    else:
        group_id_to_set = current_user.group_id

    # Validate Sector
    if job_in.sector_id:
        sector = db.query(Sector).filter(Sector.id == job_in.sector_id).first()
        if not sector:
            raise HTTPException(status_code=400, detail="Setor selecionado não existe.")
        if current_user.role != "admin" and sector.group_id != group_id_to_set:
            raise HTTPException(status_code=400, detail="Setor selecionado não pertence a esta empresa.")

    # Check duplicate in the same tenant group
    existing = db.query(JobPosition).filter(
        JobPosition.name == job_in.name,
        JobPosition.group_id == group_id_to_set
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Já existe um cargo cadastrado com este nome nesta empresa."
        )

    db_job = JobPosition(
        group_id=group_id_to_set,
        sector_id=job_in.sector_id,
        name=job_in.name,
        description=job_in.description,
        base_salary=job_in.base_salary,
        level=job_in.level,
        is_active=job_in.is_active,
        created_by=current_user.username,
        updated_by=current_user.username
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    log_action(db, current_user.id, "CREATE_JOB_POSITION", "job_positions", db_job.id, {"name": db_job.name})
    return db_job

@router.put("/{job_id}", response_model=JobPositionResponse)
def update_job_position(
    job_id: str,
    job_in: JobPositionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_hr_manager)
):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Cargo não encontrado.")
    
    if current_user.role != "admin" and db_job.group_id != current_user.group_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar dados desta empresa.")

    # Validate Sector
    if job_in.sector_id:
        sector = db.query(Sector).filter(Sector.id == job_in.sector_id).first()
        if not sector:
            raise HTTPException(status_code=400, detail="Setor selecionado não existe.")
        if current_user.role != "admin" and sector.group_id != db_job.group_id:
            raise HTTPException(status_code=400, detail="Setor selecionado não pertence a esta empresa.")

    db_job.name = job_in.name
    db_job.description = job_in.description
    db_job.base_salary = job_in.base_salary
    db_job.level = job_in.level
    db_job.sector_id = job_in.sector_id
    db_job.is_active = job_in.is_active
    db_job.updated_at = datetime.utcnow()
    db_job.updated_by = current_user.username
    
    db.commit()
    db.refresh(db_job)

    log_action(db, current_user.id, "UPDATE_JOB_POSITION", "job_positions", db_job.id, {"name": db_job.name})
    return db_job

@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
def delete_job_position(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_hr_manager)
):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Cargo não encontrado.")
    
    if current_user.role != "admin" and db_job.group_id != current_user.group_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar dados desta empresa.")

    db.delete(db_job)
    db.commit()

    log_action(db, current_user.id, "DELETE_JOB_POSITION", "job_positions", job_id)
    return {"message": "Cargo excluído com sucesso."}
