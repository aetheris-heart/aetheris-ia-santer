import shutil
import os

src = os.path.join("ui", "dist")
dst = "frontend_build"

if os.path.exists(dst):
    shutil.rmtree(dst)

shutil.copytree(src, dst)
print("✅ Frontend copié dans frontend_build avec succès !")
