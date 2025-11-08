import sqlite3
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # remonte d'un dossier
DB_PATH = os.path.join(BASE_DIR, "test.db")

print("🚑 Migration de la table 'urgences' en cours...")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 🩺 Liste des colonnes à ajouter si elles n’existent pas encore
new_columns = {
    "age": "INTEGER",
    "sexe": "VARCHAR(10)",
    "risque_vital": "BOOLEAN DEFAULT 0",
    "ambulance_id": "INTEGER",
    "date_arrivee": "DATETIME",
    "latitude": "FLOAT",
    "longitude": "FLOAT",
    "analyse_ia": "TEXT",
    "niveau_risque_ia": "VARCHAR(50)",
    "recommandation_ia": "TEXT",
    "created_at": "DATETIME",
    "updated_at": "DATETIME"
}

# 🔍 Récupération des colonnes existantes
cursor.execute("PRAGMA table_info(urgences)")
existing_columns = [col[1] for col in cursor.fetchall()]

# ➕ Ajout des nouvelles colonnes si manquantes
added_columns = []
for column, col_type in new_columns.items():
    if column not in existing_columns:
        cursor.execute(f"ALTER TABLE urgences ADD COLUMN {column} {col_type}")
        added_columns.append(column)

if added_columns:
    print(f"✅ Colonnes ajoutées : {', '.join(added_columns)}")
else:
    print("ℹ️ Toutes les colonnes existent déjà, aucune modification nécessaire.")

conn.commit()
conn.close()

print("🎯 Migration terminée avec succès — table 'urgences' prête pour les nouvelles fonctionnalités Aetheris IA 🚀")
