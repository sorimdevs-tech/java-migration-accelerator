#!/usr/bin/env python3
"""
PythonAnywhere Deployment Script for Java Migration Backend
Run this script on PythonAnywhere to deploy your backend
"""

import os
import subprocess
import sys

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd,
                              capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running: {command}")
            print(f"Error output: {result.stderr}")
            return False
        print(f"✓ {command}")
        return True
    except Exception as e:
        print(f"Exception running {command}: {e}")
        return False

def main():
    print("🚀 Java Migration Backend - PythonAnywhere Deployment")
    print("=" * 60)

    # Check if we're on PythonAnywhere
    if 'pythonanywhere' not in os.environ.get('HOME', '').lower():
        print("⚠️  Warning: This doesn't appear to be PythonAnywhere")
        print("   Continuing anyway...")

    # Get current directory
    current_dir = os.getcwd()
    backend_dir = os.path.join(current_dir, 'java-migration-backend')

    print(f"📁 Working directory: {current_dir}")
    print(f"🎯 Backend directory: {backend_dir}")

    # Check if backend directory exists
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found!")
        print("   Make sure you've uploaded the java-migration-backend folder")
        return False

    # Navigate to backend directory
    os.chdir(backend_dir)
    print(f"📂 Changed to: {backend_dir}")

    # Install dependencies
    print("\n📦 Installing dependencies...")
    if not run_command("pip install -r requirements.txt"):
        print("❌ Failed to install dependencies")
        return False

    # Check if main.py exists
    if not os.path.exists('main.py'):
        print("❌ main.py not found!")
        return False

    # Test import
    print("\n🧪 Testing application import...")
    try:
        import main
        print("✓ Application imported successfully")
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

    # Get PythonAnywhere username
    username = os.environ.get('USER', 'unknown')
    print(f"\n👤 PythonAnywhere username: {username}")

    print("\n✅ Deployment preparation complete!")
    print("\n📋 Next steps:")
    print("1. Go to PythonAnywhere Web tab")
    print("2. Add a new web app")
    print("3. Set source code directory to:", backend_dir)
    print("4. Set WSGI file content:")
    print("   from main import app as application")
    print("5. Reload the web app")
    print("6. Your backend URL will be: https://{}.pythonanywhere.com".format(username))

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)