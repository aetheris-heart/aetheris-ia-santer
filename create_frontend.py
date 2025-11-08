import os

frontend_path = os.path.join(os.getcwd(), "frontend")

# Créer le dossier s'il n'existe pas
os.makedirs(frontend_path, exist_ok=True)

# Créer index.html
index_html = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IA Santé</title>
</head>
<body>
  <div id="root">
    <h1>Bienvenue sur l'interface IA Santé</h1>
    <p>L'application est bien connectée au backend 🎉</p>
  </div>
</body>
</html>
"""

# Écrire le fichier index.html
with open(os.path.join(frontend_path, "index.html"), "w", encoding="utf-8") as f:
    f.write(index_html)

print("✅ Dossier frontend créé avec succès !")
print(f"📁 Chemin : {frontend_path}")
