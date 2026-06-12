from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine configuration
database_url = settings.DATABASE_URL

# Adjust sqlite settings if needed
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Use pg8000 driver for postgresql if database_url is postgresql://
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+pg8000://")
elif database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+pg8000://")

engine = create_engine(
    database_url, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
