"""
===========================================================
🚑 Script de migration automatique pour la table Ambulances
Projet : Aetheris IA Santé
Auteur : Ramsès ATEBA
===========================================================
Ce script :
- Vérifie la présence de toutes les colonnes du modèle Ambulance
- Les ajoute si elles manquent
- Insère des ambulances de test réalistes
===========================================================
"""

import sqlite3
from datetime import datetime

import os
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test.db")


# ✅ Colonnes attendues selon le nouveau modèle
REQUIRED_COLUMNS = {
    "latitude": "FLOAT",
    "longitude": "FLOAT",
    "vitesse": "FLOAT",
    "carburant": "VARCHAR",
    "mission_actuelle": "TEXT",
    "niveau_priorite": "VARCHAR DEFAULT 'Normale'",
    "destination": "VARCHAR",
    "derniere_mission": "DATETIME",
    "last_update": "DATETIME DEFAULT (DATETIME('now'))",
    "date_creation": "DATETIME DEFAULT (DATETIME('now'))"
}


def get_existing_columns(cursor):
    """Retourne la liste des colonnes existantes dans la table ambulances."""
    cursor.execute("PRAGMA table_info(ambulances);")
    return [col[1] for col in cursor.fetchall()]


def add_missing_columns(cursor, existing_columns):
    """Ajoute les colonnes manquantes."""
    added = []
    for col_name, col_type in REQUIRED_COLUMNS.items():
        if col_name not in existing_columns:
            cursor.execute(f"ALTER TABLE ambulances ADD COLUMN {col_name} {col_type};")
            added.append(col_name)
    return added


def insert_sample_data(cursor):
    """Insère des ambulances d'exemple si la table est vide."""
    cursor.execute("SELECT COUNT(*) FROM ambulances;")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"➡️ {count} ambulances déjà présentes — insertion d’exemples non nécessaire.")
        return

    now = datetime.utcnow().isoformat()
    samples = [
        ("AB-101-CD", "Disponible", "Robert Leach", "Équipe A", 3.8782, 11.5229, 0, "78%", None, "Normale", "Hôpital Général de Yaoundé", None, now, now),
        ("AB-202-EF", "En mission", "Mireille Nguemeta", "Équipe B", 3.8721, 11.5172, 68.4, "52%", "Transport patient critique", "Urgente", "Hôpital Central", now, now, now),
        ("AB-303-GH", "Maintenance", "Jean Claude", "Équipe C", 3.8759, 11.5201, 0, "N/A", None, "Normale", None, None, now, now),
        ("AB-404-IJ", "En mission", "Sandrine Mbida", "Équipe D", 3.8794, 11.5243, 42.6, "63%", "Retour de mission Hôpital Central", "Haute", "CHU de Yaoundé", now, now, now)
    ]

    cursor.executemany("""
        INSERT INTO ambulances (
            immatriculation, etat, chauffeur, equipe,
            latitude, longitude, vitesse, carburant,
            mission_actuelle, niveau_priorite, destination,
            derniere_mission, last_update, date_creation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, samples)

    print("✅ Ambulances de test insérées avec succès.")


def main():
    print("🚧 Migration de la table 'ambulances' en cours...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    existing = get_existing_columns(cursor)
    added = add_missing_columns(cursor, existing)
    if added:
        print(f"🧩 Colonnes ajoutées : {', '.join(added)}")
    else:
        print("✅ Aucune colonne manquante — table déjà à jour.")

    insert_sample_data(cursor)

    conn.commit()
    conn.close()
    print("🎯 Migration terminée avec succès — base de données prête !")
    print("👉 Vous pouvez maintenant tester : http://127.0.0.1:8000/ambulances/positions")


if __name__ == "__main__":
    main()
