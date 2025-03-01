import psycopg2
import pandas as pd

db = psycopg2.connect(
    host="localhost",
    user="postgres",
    password="iryeli999",
    database="job_db"
)
cursor = db.cursor()

df_anapec = pd.read_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_anapec_jobs.csv")

df_je_recrute = pd.read_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_je_recrute_jobs.csv")

insert_query = """
INSERT INTO job_offers (job_title, city, job_link, source)
VALUES (%s, %s, %s, %s)
"""

for _, row in df_anapec.iterrows():
    cursor.execute(insert_query, (row["Job Title"], row["Job Location"], row["Job Link"], "Anapec"))

for _, row in df_je_recrute.iterrows():
    cursor.execute(insert_query, (row["Job Title"], "Not specified", row["Job Link"], "Je-Recrute"))

db.commit()
cursor.close()
db.close()

print("✅ Job data successfully inserted into PostgreSQL!")
