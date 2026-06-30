import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Client, User
from app.schemas.all_schemas import ClientCreate, ClientResponse
from app.api.auth import get_current_user
from app.services.audit_service import log_action

router = APIRouter(prefix="/clients", tags=["clients"])

def check_client_viewer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role in ["admin", "admin_delegado", "socio", "gestor", "financeiro"] or current_user.has_financial_access:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Você não tem permissão para visualizar clientes."
    )

def check_client_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role in ["admin", "admin_delegado", "socio", "gestor", "financeiro"] or current_user.has_financial_access:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Você não tem permissão para gerenciar clientes."
    )

@router.get("", response_model=List[ClientResponse])
def list_clients(
    group_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_client_viewer)
):
    query = db.query(Client)
    if current_user.role != "admin":
        query = query.filter(Client.group_id == current_user.group_id)
    elif group_id:
        query = query.filter(Client.group_id == group_id)
        
    return query.order_by(Client.corporate_name.asc()).all()

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_client_manager)
):
    db_client = Client(
        **client_in.dict(),
        group_id=current_user.group_id if current_user.role != "admin" else client_in.group_id or current_user.group_id,
        created_by=current_user.username,
        updated_by=current_user.username
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)

    log_action(
        db,
        current_user.id,
        "CREATE_CLIENT",
        "clients",
        db_client.id,
        {"trade_name": db_client.trade_name}
    )

    return db_client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: str,
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_client_manager)
):
    query = db.query(Client).filter(Client.id == client_id)
    if current_user.role != "admin":
        query = query.filter(Client.group_id == current_user.group_id)
        
    db_client = query.first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    for field, val in client_in.dict(exclude_unset=True).items():
        setattr(db_client, field, val)

    db_client.updated_at = datetime.utcnow()
    db_client.updated_by = current_user.username
    db.commit()
    db.refresh(db_client)

    log_action(
        db,
        current_user.id,
        "UPDATE_CLIENT",
        "clients",
        db_client.id,
        {"trade_name": db_client.trade_name}
    )

    return db_client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_client_manager)
):
    query = db.query(Client).filter(Client.id == client_id)
    if current_user.role != "admin":
        query = query.filter(Client.group_id == current_user.group_id)
        
    db_client = query.first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    log_action(
        db,
        current_user.id,
        "DELETE_CLIENT",
        "clients",
        db_client.id,
        {"trade_name": db_client.trade_name}
    )

    db.delete(db_client)
    db.commit()
    return None
