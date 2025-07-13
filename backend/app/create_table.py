# create_tables.py

from models.models import Base
from core.db import engine

print("📄 Creating all tables...")
Base.metadata.create_all(bind=engine)
print("✅ Done.")
