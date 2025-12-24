import sqlite3
from pathlib import Path

# Connect to database
db_path = Path(__file__).parent / "eduassess.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("=" * 50)
print("TABLES IN DATABASE:")
print("=" * 50)
for table in tables:
    print(f"- {table[0]}")

print("\n" + "=" * 50)
print("USERS TABLE:")
print("=" * 50)

# First check what columns exist
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
print("\nColumns in users table:")
for col in columns:
    print(f"  - {col[1]} ({col[2]})")

# Get user data
cursor.execute("SELECT * FROM questions")
users = cursor.fetchall()
print(f"\nTotal questions: {len(users)}")
for user in users:
    print(f"\nUser data: {user}")

cursor.execute("PRAGMA table_info(questions)")
columns = cursor.fetchall()
print("\nColumns in questions table:")
for col in columns:
    print(f"  - {col[1]} ({col[2]})")

# Get user data
cursor.execute("SELECT * FROM users")
users = cursor.fetchall()
print(f"\nTotal users: {len(users)}")
for user in users:
    print(f"\nUser data: {user}")

conn.close()
print("\n" + "=" * 50)
