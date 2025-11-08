import os
from api.database import Base, engine

#  Chemin vers ta base SQLite
DB_FILE = "test.db"

# 1. Supprimer l'ancienne base si elle existe
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)
    print(f" Base {DB_FILE} supprimée.")

# 2. Recréer toutes les tables selon les modèles
Base.metadata.create_all(bind=engine)
print(f" Nouvelle base {DB_FILE} recréée avec toutes les tables à jour.")
