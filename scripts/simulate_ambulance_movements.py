import sqlite3
import random
import time
from datetime import datetime

# Nom de ta base SQLite
DB_PATH = r"C:\PROJET IA SANTE 2\test.db"

def random_delta(value: float, amplitude: float = 0.001):
    """Génère un léger déplacement GPS."""
    return value + random.uniform(-amplitude, amplitude)

def simulate_movements():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("🚑 Simulation IA Aetheris Command Center activée...")
    print("————————————————————————————————————————————————————————————")
    while True:
        cursor.execute("SELECT id, latitude, longitude, vitesse, carburant, etat FROM ambulances")
        ambulances = cursor.fetchall()

        for amb_id, lat, lon, vit, carbu, etat in ambulances:
            if lat is None or lon is None:
                continue

            # 🛰️ 1️⃣ Déplacement selon l’état
            if etat == "En mission":
                new_lat = random_delta(lat, 0.002)
                new_lon = random_delta(lon, 0.002)
                new_vitesse = random.uniform(60, 100)
            elif etat == "Disponible":
                new_lat = random_delta(lat, 0.0008)
                new_lon = random_delta(lon, 0.0008)
                new_vitesse = random.uniform(0, 40)
            else:  # Maintenance ou autre
                new_lat, new_lon, new_vitesse = lat, lon, 0

            # 🔋 2️⃣ Carburant
            try:
                pourcentage = int(str(carbu).replace("%", "")) if carbu else 70
            except ValueError:
                pourcentage = 70
            pourcentage = max(5, pourcentage - random.randint(0, 2))

            # 📡 3️⃣ Simulation GPS (facultative)
            gps_signal = random.choices(["🟢 Actif", "🟡 Moyen", "🔴 Perdu"], [90, 8, 2])[0]

            # 💾 4️⃣ Mise à jour SQL
            now = datetime.utcnow().isoformat()
            cursor.execute("""
                UPDATE ambulances
                SET latitude = ?, longitude = ?, vitesse = ?, carburant = ?, last_update = ?
                WHERE id = ?
            """, (new_lat, new_lon, new_vitesse, f"{pourcentage}%", now, amb_id))

            # 🎨 5️⃣ Journal coloré
            color = "\033[92m" if etat == "En mission" else "\033[93m" if etat == "Maintenance" else "\033[94m"
            reset = "\033[0m"
            print(f"{color}🚑 Ambulance {amb_id:<2} | {etat:<12} | "
                  f"{new_vitesse:>5.1f} km/h | Carburant: {pourcentage:>3}% | GPS: {gps_signal}{reset}")

        conn.commit()
        print("————————————————————————————————————————————————————————————")
        time.sleep(20)  # mise à jour toutes les 20 secondes

if __name__ == "__main__":
    try:
        simulate_movements()
    except KeyboardInterrupt:
        print("\n🛑 Simulation arrêtée proprement.")
