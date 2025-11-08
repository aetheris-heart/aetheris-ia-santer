from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.database import Base  # si besoin

DATABASE_URL = "sqlite:///./test.db"  # adapte avec ton URL réelle


