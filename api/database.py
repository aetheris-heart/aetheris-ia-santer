# api/database.py
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# → DB toujours à la racine du projet, peu importe d’où tu lances Uvicorn
DB_PATH = (Path(__file__).resolve().parent.parent / "test.db").as_posix()
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # seulement SQLite
    # echo=True,  # décommente temporairement si tu veux voir les SQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dépendance FastAPI: ouvre/ferme proprement une session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


