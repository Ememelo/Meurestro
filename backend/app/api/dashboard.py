from datetime import date, datetime
from typing import Optional
from sqlalchemy import func
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Employee, Contract, DisciplinaryAction, Overtime, User, Leave
from app.api.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("")
def get_dashboard_data(
    employee_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    current_month = today.month
    current_year = today.year
    
    if employee_id:
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp:
            return {"error": "Colaborador não encontrado."}
            
        status_label = "Ativo" if emp.status == "active" else "Afastado" if emp.status == "on_leave" else "Desligado"
        salary = float(emp.contract.base_salary) if emp.contract else 0.0
        
        warnings_count = db.query(func.count(DisciplinaryAction.id)).filter(
            DisciplinaryAction.employee_id == employee_id, DisciplinaryAction.type == "warning"
        ).scalar() or 0
        suspensions_count = db.query(func.count(DisciplinaryAction.id)).filter(
            DisciplinaryAction.employee_id == employee_id, DisciplinaryAction.type == "suspension"
        ).scalar() or 0
        
        total_ot_minutes = db.query(func.sum(
            Overtime.hours_50_minutes + Overtime.hours_100_minutes + Overtime.hours_night_minutes
        )).filter(Overtime.employee_id == employee_id).scalar() or 0
        total_ot_hours = round(total_ot_minutes / 60.0, 1)
        
        leaves_count = db.query(func.count(Leave.id)).filter(Leave.employee_id == employee_id).scalar() or 0
        
        is_birthday_this_month = emp.dob.month == current_month if emp.dob else False
        scale_type = emp.shift.scale_type if emp.shift else "N/A"
        
        return {
            "is_individual": True,
            "employee": {
                "id": emp.id,
                "name": emp.name,
                "registration_number": emp.registration_number,
                "status": emp.status,
                "status_label": status_label,
                "role": emp.contract.role if emp.contract else "N/A",
                "department": emp.contract.department if emp.contract else "N/A",
                "admission_date": emp.contract.admission_date.strftime("%d/%m/%Y") if emp.contract and emp.contract.admission_date else "N/A",
                "dob": emp.dob.strftime("%d/%m") if emp.dob else "N/A",
                "is_birthday_this_month": is_birthday_this_month,
                "scale_type": scale_type
            },
            "kpis": {
                "salary": salary,
                "warnings_count": warnings_count,
                "suspensions_count": suspensions_count,
                "overtime_hours": total_ot_hours,
                "leaves_count": leaves_count
            }
        }
        
    # General metrics calculation
    total_active = db.query(func.count(Employee.id)).filter(Employee.status == "active").scalar() or 0
    total_on_leave = db.query(func.count(Employee.id)).filter(Employee.status == "on_leave").scalar() or 0
    total_terminated = db.query(func.count(Employee.id)).filter(Employee.status == "terminated").scalar() or 0
    
    avg_salary_query = db.query(func.avg(Contract.base_salary)).join(Employee).filter(Employee.status == "active").scalar()
    average_salary = round(float(avg_salary_query), 2) if avg_salary_query else 0.0
    
    total_disciplinary = db.query(func.count(DisciplinaryAction.id)).scalar() or 0
    warnings_count = db.query(func.count(DisciplinaryAction.id)).filter(DisciplinaryAction.type == "warning").scalar() or 0
    suspensions_count = db.query(func.count(DisciplinaryAction.id)).filter(DisciplinaryAction.type == "suspension").scalar() or 0
    
    total_ot_minutes = db.query(func.sum(
        Overtime.hours_50_minutes + Overtime.hours_100_minutes + Overtime.hours_night_minutes
    )).scalar() or 0
    total_ot_hours = round(total_ot_minutes / 60.0, 1)
    
    active_employees = db.query(Employee).filter(Employee.status != "terminated").all()
    birthdays = []
    for emp in active_employees:
        if emp.dob and emp.dob.month == current_month:
            birthdays.append({
                "id": emp.id,
                "name": emp.name,
                "dob": emp.dob.strftime("%d/%m"),
                "phone": emp.phone,
                "department": emp.contract.department if emp.contract else "N/A"
            })
            
    birthdays = sorted(birthdays, key=lambda x: int(x["dob"].split("/")[0]))
            
    dept_counts = {}
    role_counts = {}
    
    for emp in active_employees:
        if emp.contract:
            dept = emp.contract.department or "Não Especificado"
            role = emp.contract.role or "Não Especificado"
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
            role_counts[role] = role_counts.get(role, 0) + 1
            
    by_department = [{"name": k, "count": v} for k, v in dept_counts.items()]
    by_role = [{"name": k, "count": v} for k, v in role_counts.items()]
    
    admissions_year = db.query(func.count(Contract.id)).filter(
        func.strftime("%Y", Contract.admission_date) == str(current_year)
    ).scalar() if db.bind.name == "sqlite" else db.query(func.count(Contract.id)).filter(
        func.extract("year", Contract.admission_date) == current_year
    ).scalar()
    
    admissions_year = admissions_year or 0
    
    return {
        "kpis": {
            "active_employees": total_active,
            "on_leave_employees": total_on_leave,
            "terminated_employees": total_terminated,
            "average_salary": average_salary,
            "total_disciplinary": total_disciplinary,
            "warnings_count": warnings_count,
            "suspensions_count": suspensions_count,
            "overtime_hours": total_ot_hours,
            "admissions_this_year": admissions_year
        },
        "birthdays": birthdays[:10],
        "charts": {
            "by_department": by_department,
            "by_role": by_role
        }
    }

