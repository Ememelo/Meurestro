import json
from sqlalchemy.orm import Session
from app.models.all_models import AuditLog

def log_action(
    db: Session,
    user_id: str | None,
    action: str,
    table_name: str | None = None,
    record_id: str | None = None,
    changed_fields: dict | None = None
) -> AuditLog:
    """
    Log an administrative action to the database.
    """
    fields_str = None
    if changed_fields is not None:
        try:
            fields_str = json.dumps(changed_fields)
        except Exception:
            fields_str = str(changed_fields)
            
    db_log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        changed_fields=fields_str
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
