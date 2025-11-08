import os
import sys
import pkgutil
import importlib

# S'assurer que le projet est bien dans le PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

print("=== ROUTES QUI IMPORTENT Patient ===")

# On parcourt tout le package api.routes
package = "api.routes"
package_path = os.path.join(os.path.dirname(__file__), "..", "api", "routes")

for _, module_name, _ in pkgutil.iter_modules([package_path]):
    full_module = f"{package}.{module_name}"
    try:
        mod = importlib.import_module(full_module)
        source = open(mod.__file__, "r", encoding="utf-8").read()
        if "from app.models.patient import Patient" in source or "import app.models.patient" in source:
            print(f"❌ {full_module} → importe encore Patient directement !")
    except Exception as e:
        print(f"⚠️ Erreur en important {full_module}: {e}")

print("✅ Scan terminé.")
