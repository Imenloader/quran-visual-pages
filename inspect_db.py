import sqlite3
import os
import sys

# Ensure utf-8 output
if sys.stdout.encoding != 'UTF-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

db_path = r"C:\Users\Socia\Downloads\Quran-Data-version-2.0\Quran-Data-version-2.0\data\sqlite\database.sqlite"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(verses);")
columns = [c[1] for c in cursor.fetchall()]
print("Columns in verses:", columns)

# Check if there is any word table
cursor.execute("SELECT name FROM sqlite_master WHERE name LIKE '%word%';")
print("Word-related tables:", cursor.fetchall())

conn.close()
