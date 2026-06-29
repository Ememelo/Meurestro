import os
import json
import zipfile
import shutil
import sqlite3
import threading
import time
import smtplib
from datetime import datetime, date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.all_models import (
    User, Group, Employee, Dependent, Contract, CareerHistory,
    DisciplinaryAction, Shift, Overtime, Leave, EmployeeDocument,
    Sector, JobPosition, WorkScale, Supplier, FinancialRevenue,
    FinancialExpense, AuditLog
)

# Helper to serialize SQLAlchemy model objects to dictionary
def to_dict(model_obj):
    if not model_obj:
        return None
    d = {}
    for column in model_obj.__table__.columns:
        val = getattr(model_obj, column.name)
        if isinstance(val, (datetime, date)):
            d[column.name] = val.isoformat()
        else:
            d[column.name] = val
    return d

def backup_group_data(db: Session, group_id: str) -> str:
    # 1. Get group info
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        return None
        
    group_name = group.name.replace(" ", "_").lower()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    temp_dir = os.path.join("backups", f"temp_backup_{group_id}_{timestamp}")
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Query all models filtered by group
        data = {
            "backup_date": datetime.now().isoformat(),
            "group": to_dict(group),
            "users": [to_dict(u) for u in db.query(User).filter(User.group_id == group_id).all()],
            "employees": [to_dict(e) for e in db.query(Employee).filter(Employee.group_id == group_id).all()],
            "dependents": [to_dict(d) for d in db.query(Dependent).join(Employee).filter(Employee.group_id == group_id).all()],
            "contracts": [to_dict(c) for c in db.query(Contract).join(Employee).filter(Employee.group_id == group_id).all()],
            "career_histories": [to_dict(ch) for ch in db.query(CareerHistory).join(Employee).filter(Employee.group_id == group_id).all()],
            "disciplinary_actions": [to_dict(da) for da in db.query(DisciplinaryAction).join(Employee).filter(Employee.group_id == group_id).all()],
            "shifts": [to_dict(s) for s in db.query(Shift).join(Employee).filter(Employee.group_id == group_id).all()],
            "overtimes": [to_dict(o) for o in db.query(Overtime).join(Employee).filter(Employee.group_id == group_id).all()],
            "leaves": [to_dict(l) for l in db.query(Leave).join(Employee).filter(Employee.group_id == group_id).all()],
            "employee_documents": [to_dict(ed) for ed in db.query(EmployeeDocument).join(Employee).filter(Employee.group_id == group_id).all()],
            "sectors": [to_dict(sec) for sec in db.query(Sector).filter(Sector.group_id == group_id).all()],
            "job_positions": [to_dict(jp) for jp in db.query(JobPosition).filter(JobPosition.group_id == group_id).all()],
            "work_scales": [to_dict(ws) for ws in db.query(WorkScale).filter(WorkScale.group_id == group_id).all()],
            "suppliers": [to_dict(sup) for sup in db.query(Supplier).filter(Supplier.group_id == group_id).all()],
            "financial_revenues": [to_dict(fr) for fr in db.query(FinancialRevenue).filter(FinancialRevenue.group_id == group_id).all()],
            "financial_expenses": [to_dict(fe) for fe in db.query(FinancialExpense).filter(FinancialExpense.group_id == group_id).all()],
            "audit_logs": [to_dict(al) for al in db.query(AuditLog).filter(AuditLog.group_id == group_id).all()]
        }
        
        # Write JSON data
        json_path = os.path.join(temp_dir, "data.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        # Copy uploaded files
        docs_dir = os.path.join(temp_dir, "documents")
        os.makedirs(docs_dir, exist_ok=True)
        
        documents = db.query(EmployeeDocument).join(Employee).filter(Employee.group_id == group_id).all()
        for doc in documents:
            if doc.file_path:
                full_src_path = doc.file_path
                if not os.path.exists(full_src_path):
                    full_src_path = os.path.join(settings.UPLOAD_DIR, "documents", os.path.basename(doc.file_path))
                    
                if os.path.exists(full_src_path) and os.path.isfile(full_src_path):
                    shutil.copy2(full_src_path, os.path.join(docs_dir, os.path.basename(doc.file_path)))
                    
        # Zip the directory
        zip_filename = f"backup_{group_name}_{timestamp}.zip"
        zip_path = os.path.join("backups", zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_dir)
                    zip_file.write(file_path, arcname)
                    
        return zip_path
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def backup_full_database() -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"backup_full_database_{timestamp}.zip"
    zip_path = os.path.join("backups", zip_filename)
    
    db_file = "lira_rh.db"
    if settings.DATABASE_URL.startswith("sqlite:///"):
        db_file = settings.DATABASE_URL.replace("sqlite:///", "")
        
    if not os.path.exists(db_file):
        return None
        
    temp_db_copy = os.path.join("backups", f"temp_lira_rh_{timestamp}.db")
    
    try:
        # Use sqlite3 backup API
        src_conn = sqlite3.connect(db_file)
        dest_conn = sqlite3.connect(temp_db_copy)
        with dest_conn:
            src_conn.backup(dest_conn)
        src_conn.close()
        dest_conn.close()
        
        # Zip database and uploads
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            zip_file.write(temp_db_copy, "lira_rh.db")
            
            if os.path.exists(settings.UPLOAD_DIR):
                for root, dirs, files in os.walk(settings.UPLOAD_DIR):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, os.path.dirname(settings.UPLOAD_DIR))
                        zip_file.write(file_path, arcname)
                        
        return zip_path
    finally:
        if os.path.exists(temp_db_copy):
            os.remove(temp_db_copy)

def send_backup_email(to_email: str, subject: str, body: str, attachment_path: str) -> bool:
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[Backup Service] E-mail SMTP não configurado. Backup salvo localmente em: {attachment_path}")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as f:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(f.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename="{os.path.basename(attachment_path)}"'
                )
                msg.attach(part)
                
        # Connect and send
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        server.quit()
        print(f"[Backup Service] Backup enviado por e-mail com sucesso para {to_email}")
        return True
    except Exception as e:
        print(f"[Backup Service] Erro ao enviar e-mail de backup para {to_email}: {e}")
        return False

def run_backup_job():
    print("[Backup Service] Iniciando tarefa de backup de segurança...")
    db = SessionLocal()
    try:
        # 1. Full database backup for Admin Master
        admin_user = db.query(User).filter(User.role == "admin").first()
        if admin_user and admin_user.email:
            print(f"[Backup Service] Gerando backup completo para o Administrador Master ({admin_user.email})...")
            full_zip = backup_full_database()
            if full_zip:
                body = (
                    "Olá Administrador Master,\n\n"
                    "Segue em anexo o backup de segurança semanal completo do sistema MeuRestô.\n"
                    "Este arquivo contém a base de dados SQLite (lira_rh.db) e todos os uploads cadastrados.\n\n"
                    f"Data do Backup: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n"
                    "Atenciosamente,\nEquipe MeuRestô"
                )
                send_backup_email(admin_user.email, "MeuRestô - Backup Semanal Completo", body, full_zip)
                
        # 2. Segmented backups for Admin Delegado of each group
        groups = db.query(Group).filter(Group.is_active == True).all()
        for group in groups:
            delegados = db.query(User).filter(User.group_id == group.id, User.role == "admin_delegado").all()
            if not delegados:
                continue
                
            print(f"[Backup Service] Gerando backup isolado para o grupo '{group.name}'...")
            group_zip = backup_group_data(db, group.id)
            if group_zip:
                for del_user in delegados:
                    if del_user.email:
                        body = (
                            f"Olá {del_user.username},\n\n"
                            f"Segue em anexo o backup de segurança semanal do grupo/unidade '{group.name}'.\n"
                            "Este arquivo contém a exportação isolada dos seus dados cadastrados e os documentos dos colaboradores.\n\n"
                            f"Data do Backup: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n"
                            "Atenciosamente,\nEquipe MeuRestô"
                        )
                        send_backup_email(
                            del_user.email,
                            f"MeuRestô - Backup Semanal ({group.name})",
                            body,
                            group_zip
                        )
    except Exception as e:
        print(f"[Backup Service] Erro geral na execução do backup: {e}")
    finally:
        db.close()

def check_and_run_backup():
    os.makedirs("backups", exist_ok=True)
    status_file = os.path.join("backups", "last_backup.json")
    
    last_run = None
    if os.path.exists(status_file):
        try:
            with open(status_file, "r") as f:
                status_data = json.load(f)
                last_run = datetime.fromisoformat(status_data.get("last_run"))
        except Exception:
            pass
            
    now = datetime.now()
    if last_run is None or (now - last_run).total_seconds() >= 7 * 24 * 60 * 60:
        run_backup_job()
        try:
            with open(status_file, "w") as f:
                json.dump({"last_run": now.isoformat()}, f)
        except Exception as e:
            print(f"[Backup Service] Erro ao salvar status de backup: {e}")

def scheduler_loop():
    time.sleep(10)
    while True:
        try:
            check_and_run_backup()
        except Exception as e:
            print(f"[Backup Service] Erro no loop de agendamento: {e}")
        time.sleep(3600)

def start_backup_scheduler():
    t = threading.Thread(target=scheduler_loop, daemon=True)
    t.start()
    print("[Backup Service] Agendador de backup semanal iniciado em segundo plano.")
