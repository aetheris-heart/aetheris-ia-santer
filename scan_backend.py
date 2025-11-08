import os
import subprocess

def scan_python_files(root_dir="."):
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".py"):
                filepath = os.path.join(subdir, file)
                print(f"🔍 Analyse {filepath}")
                try:
                    subprocess.check_output(["python", "-m", "py_compile", filepath])
                except subprocess.CalledProcessError as e:
                    print(f"❌ Erreur dans {filepath} : {e}")
                else:
                    print(f"✅ OK : {filepath}")

if __name__ == "__main__":
    scan_python_files("api")  # scanne ton backend
