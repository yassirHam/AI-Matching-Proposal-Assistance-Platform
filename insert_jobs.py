import psycopg2
import pandas as pd

# Connect to PostgreSQL
db = psycopg2.connect(
    host="localhost",
    user="postgres",
    password="iryeli999",
    database="job_db"
)
cursor = db.cursor()

# Load CSV files
df_anapec = pd.read_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_anapec_jobs.csv")
df_je_recrute = pd.read_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_je_recrute_jobs.csv")

# Strip column names of spaces (if any)
df_anapec.columns = df_anapec.columns.str.strip()
df_je_recrute.columns = df_je_recrute.columns.str.strip()

# Check if CSV is empty
if df_anapec.empty or df_je_recrute.empty:
    print("❌ One of the CSV files is empty!")
    exit()

# SQL Insert Query
insert_query = """
INSERT INTO job_offers (job_title, city, job_link, source)
VALUES (%s, %s, %s, %s)
"""

# Insert Anapec Data
for _, row in df_anapec.iterrows():
    print("Inserting:", row["Job Title"], row["Job Location"], row["Job Link"], "Anapec")  # Debug print
    cursor.execute(insert_query, (row["Job Title"], row["Job Location"], row["Job Link"], "Anapec"))
    db.commit()

# Insert Je-Recrute Data
for _, row in df_je_recrute.iterrows():
    print("Inserting:", row["Job Title"], "Not specified", row["Job Link"], "Je-Recrute")  # Debug print
    cursor.execute(insert_query, (row["Job Title"], "Not specified", row["Job Link"], "Je-Recrute"))
    db.commit()

cursor.close()
db.close()

print("✅ Job data successfully inserted into PostgreSQL!")
