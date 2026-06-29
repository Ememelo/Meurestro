import os

class Settings:
    PROJECT_NAME: str = "MeuRestô"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL: default to SQLite for easy local setup, PostgreSQL when run via Docker
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lira_rh.db")
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
    # SMTP Settings for Backups
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "backup@meuresto.com.br")
    
    # Ensure upload directory exists
    @classmethod
    def initialize(cls):
        os.makedirs(cls.UPLOAD_DIR, exist_ok=True)
        os.makedirs(os.path.join(cls.UPLOAD_DIR, "photos"), exist_ok=True)
        os.makedirs(os.path.join(cls.UPLOAD_DIR, "documents"), exist_ok=True)

settings = Settings()
settings.initialize()
