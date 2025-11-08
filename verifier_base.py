# fichier : verifier_base.py

import sqlite3
from pathlib import Path

# Chemin vers ta base de données
DB_PATH = Path("./test.db")

def verifier_tables():
    if not DB_PATH.exists():
        print("❌ La base de données test.db n'existe pas.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("\n✅ Connexion à la base de données réussie.\n")
    
    # Liste toutes les tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    if not tables:
        print("❌ Aucune table trouvée.")
        return

    print("📚 Tables disponibles :")
    for (table_name,) in tables:
        print(f"— {table_name}")

    print("\n🔍 Détails des colonnes :")
    for (table_name,) in tables:
        print(f"\n🩺 Table: {table_name}")
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        for column in columns:
            print(f"  ➔ {column[1]} ({column[2]})")

    # Test d'insertion dans 'documents' s'il existe
    if ('documents',) in tables:
        print("\n📝 Tentative d'insertion test dans 'documents'...")
        try:
            cursor.execute("""
                INSERT INTO documents (patient_id, file_path, description)
                VALUES (?, ?, ?)
            """, (1, "path/to/document_test.pdf", "Document médical test inséré par Aetheris"))
            conn.commit()
            print("✅ Insertion test réussie dans 'documents'.")
        except Exception as e:
            print(f"❌ Échec de l'insertion test : {e}")

    conn.close()
    print("\n🔒 Connexion fermée proprement.")

if __name__ == "__main__":
    verifier_tables()
