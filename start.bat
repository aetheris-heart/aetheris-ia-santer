@echo off
title Lancement de l'API IA Santé
echo 🧠 Initialisation de la base de données...
python init_db.py

echo 🚀 Lancement de l'API FastAPI sur http://127.0.0.1:8000 ...
uvicorn main:app --reload

pause
