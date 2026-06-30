import uuid
from sqlalchemy.orm import Session
from app.models.all_models import Sector, JobPosition, WorkScale

def prepopulate_group_scales(db: Session, group_id: str):
    # Define default scales based on user specifications
    default_scales = [
        {
            "name": "Escala 5x2 (44h)",
            "entry_time": "08:00",
            "exit_time": "17:48",
            "interval_minutes": 60,
            "description": "5 dias trabalhados x 2 de descanso. Horário típico: 8h48m diários para completar 44h semanais. Exemplo: Segunda a sexta-feira, das 08:00 às 17:48 (com 1h de intervalo). Folgas: Dois dias consecutivos, geralmente aos fins de semana."
        },
        {
            "name": "Escala 6x1 (44h)",
            "entry_time": "08:00",
            "exit_time": "16:20",
            "interval_minutes": 60,
            "description": "6 dias trabalhados x 1 de descanso. Horário típico: 7h20m diários para completar 44h semanais. Exemplo: Segunda a sábado, das 08:00 às 16:20 (com 1h de intervalo). Folgas: Um dia na semana e um domingo a cada sete semanas."
        },
        {
            "name": "Escala 12x36",
            "entry_time": "07:00",
            "exit_time": "19:00",
            "interval_minutes": 60,
            "description": "12 horas de trabalho x 36 de descanso. Jornada contínua de 12 horas, seguida obrigatoriamente por 36 horas de descanso ininterrupto. Exemplo: Trabalha das 07:00 às 19:00, folga o restante do dia e o dia seguinte inteiro. Intervalo: 1 hora de pausa para refeição."
        },
        {
            "name": "Escala 24x48",
            "entry_time": "08:00",
            "exit_time": "08:00",
            "interval_minutes": 60,
            "description": "24 horas de trabalho x 48 de descanso. Jornada contínua de 24 horas, com descanso imediato de 48 horas. Exemplo: Comum em serviços de emergência (bombeiros, vigilância e certas categorias da saúde)."
        }
    ]

    for scale in default_scales:
        existing = db.query(WorkScale).filter(
            WorkScale.group_id == group_id,
            WorkScale.name == scale["name"]
        ).first()
        
        if not existing:
            db_scale = WorkScale(
                id=str(uuid.uuid4()),
                group_id=group_id,
                name=scale["name"],
                entry_time=scale["entry_time"],
                exit_time=scale["exit_time"],
                interval_minutes=scale["interval_minutes"],
                description=scale["description"],
                is_active=True,
                created_by="system",
                updated_by="system"
            )
            db.add(db_scale)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Restaurant Defaults] Erro ao pré-cadastrar escalas para o grupo {group_id}: {e}")

def prepopulate_restaurant_defaults(db: Session, group_id: str):
    # Prepopulate default scales first
    prepopulate_group_scales(db, group_id)

    # Check if there are already sectors for this group
    existing_sectors_count = db.query(Sector).filter(Sector.group_id == group_id).count()
    if existing_sectors_count > 0:
        return  # Already populated or has custom entries

    # Default sectors structure
    defaults = {
        "Cozinha": {
            "description": "Setor responsável pela preparação dos alimentos, pratos e controle da praça quente/fria.",
            "roles": [
                {"name": "Chef de Cozinha", "base_salary": 4500.0, "description": "Liderança da cozinha, elaboração de cardápios e controle de qualidade."},
                {"name": "Sub-Chef de Cozinha", "base_salary": 3200.0, "description": "Auxílio ao chef na supervisão da equipe e preparação."},
                {"name": "Cozinheiro", "base_salary": 2400.0, "description": "Preparação e finalização dos pratos da praça quente/fria."},
                {"name": "Auxiliar de Cozinha", "base_salary": 1700.0, "description": "Limpeza de insumos, organização da cozinha e tarefas gerais de apoio."}
            ]
        },
        "Salão": {
            "description": "Setor de atendimento direto ao cliente, mesas e delivery.",
            "roles": [
                {"name": "Maitre / Supervisor", "base_salary": 2800.0, "description": "Coordenação do salão, recepção de clientes e controle do serviço."},
                {"name": "Garçom", "base_salary": 1850.0, "description": "Atendimento às mesas, apresentação do cardápio e venda ativa."},
                {"name": "Cumim (Auxiliar de Salão)", "base_salary": 1600.0, "description": "Organização do salão, transporte de pratos e limpeza de mesas."},
                {"name": "Hostess / Recepcionista", "base_salary": 1800.0, "description": "Recepção dos clientes na entrada e organização da fila de espera."}
            ]
        },
        "Bar": {
            "description": "Setor de preparo de bebidas, drinks e coquetéis.",
            "roles": [
                {"name": "Bartender / Barman", "base_salary": 2200.0, "description": "Preparo de coquetéis, controle de estoque de bebidas e atendimento do bar."},
                {"name": "Auxiliar de Bar", "base_salary": 1650.0, "description": "Organização do balcão, reposição de gelo, frutas e copos."}
            ]
        },
        "Administração": {
            "description": "Gestão financeira, compras, recursos humanos e controle geral do caixa.",
            "roles": [
                {"name": "Gerente Geral", "base_salary": 5000.0, "description": "Gerenciamento completo da operação, faturamento e equipe do restaurante."},
                {"name": "Caixa / Operador de Caixa", "base_salary": 1900.0, "description": "Fechamento de contas dos clientes, conciliação e controle do fluxo diário."},
                {"name": "Auxiliar Administrativo", "base_salary": 2000.0, "description": "Controle de compras, notas fiscais, contas a pagar e suporte geral."}
            ]
        },
        "Limpeza e Manutenção": {
            "description": "Higienização geral do restaurante, banheiros, salão e lavagem de utensílios (Steward).",
            "roles": [
                {"name": "Steward (Lavador de Pratos)", "base_salary": 1600.0, "description": "Higienização de pratos, panelas, talheres e utensílios da cozinha."},
                {"name": "Auxiliar de Limpeza / Faxina", "base_salary": 1600.0, "description": "Limpeza do salão, banheiros, vestiários e áreas comuns do restaurante."}
            ]
        }
    }

    try:
        for sector_name, info in defaults.items():
            sector_id = str(uuid.uuid4())
            db_sector = Sector(
                id=sector_id,
                group_id=group_id,
                name=sector_name,
                description=info["description"],
                is_active=True
            )
            db.add(db_sector)
            
            for role in info["roles"]:
                role_id = str(uuid.uuid4())
                db_role = JobPosition(
                    id=role_id,
                    group_id=group_id,
                    sector_id=sector_id,
                    name=role["name"],
                    base_salary=role["base_salary"],
                    description=role["description"],
                    level="Operacional" if sector_name != "Administração" else "Supervisão"
                )
                db.add(db_role)
                
        db.commit()
        print(f"[Restaurant Defaults] Pré-cadastro concluído com sucesso para o grupo: {group_id}")
    except Exception as e:
        db.rollback()
        print(f"[Restaurant Defaults] Erro ao pré-cadastrar setores e funções: {e}")
