import sys
import os

# Add backend app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.services.seed_service import seed_database

if __name__ == "__main__":
    print("Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)
    
    print("Executing FIND-BACK AI seed process...")
    db = SessionLocal()
    try:
        seed_database(db)
        print("Seed data process completed successfully.")
    except Exception as e:
        print(f"Error during seed execution: {e}")
    finally:
        db.close()
