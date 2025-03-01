import psycopg2
import pandas as pd

# Use Render's database
DATABASE_URL = "postgresql://job_db_her2_user:Oy5zHIS9rVAbnpbJUUifhmf2cWFo5YZ1@dpg-cv16da9opnds73fev76g-a/job_db_her2"

conn = psycopg2.connect(DATABASE_URL, sslmode="require")
cursor = conn.cursor()

# Load CSV files
df_anapec = pd.read_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_anapec_jobs.csv")
df_je_recrute = pd.read_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_je_recrute_jobs.csv")

insert_query = """
INSERT INTO job_offers (job_title, city, job_link, source)
VALUES (%s, %s, %s, %s)
"""

# Insert Anapec jobs
for _, row in df_anapec.iterrows():
    cursor.execute(insert_query, (row["Job Title"], row["Job Location"], row["Job Link"], "Anapec"))

# Insert Je-Recrute jobs
for _, row in df_je_recrute.iterrows():
    cursor.execute(insert_query, (row["Job Title"], "Not specified", row["Job Link"], "Je-Recrute"))

conn.commit()
cursor.close()
conn.close()

print("✅ Job data successfully inserted into Render PostgreSQL!")
