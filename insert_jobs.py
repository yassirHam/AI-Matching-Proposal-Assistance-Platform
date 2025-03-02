import psycopg2
import csv

DATABASE_URL = "postgresql://postgres:zOFKgEWJINuNBnzzLrdRwQTcbCZeYmCZ@crossover.proxy.rlwy.net:25810/railway"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    print("✅ Connected successfully!")

    create_table_query = """
    CREATE TABLE IF NOT EXISTS job_offers (
        id SERIAL PRIMARY KEY,
        job_title TEXT NOT NULL,
        city TEXT NOT NULL,
        job_link TEXT NOT NULL,
        source TEXT NOT NULL
    );
    """
    cursor.execute(create_table_query)
    conn.commit()
    print("✅ Table 'job_offers' is ready.")

    def insert_jobs_from_csv(csv_file_path, has_location):
        """Insert job data from CSV into the database"""
        with open(csv_file_path, mode="r", encoding="utf-8") as file:
            reader = csv.reader(file)
            next(reader)  # Skip header row

            insert_query = "INSERT INTO job_offers (job_title, city, job_link, source) VALUES (%s, %s, %s, %s);"
            job_data = []

            for row in reader:
                job_title = row[0]
                job_link = row[1]
                city = row[2] if has_location else "Unknown"  # Default to "Unknown" if city is missing
                source = "CSV Import"

                job_data.append((job_title, city, job_link, source))

            cursor.executemany(insert_query, job_data)
            conn.commit()
            print(f"✅ Inserted {len(job_data)} jobs from {csv_file_path}")

    insert_jobs_from_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_je_recrute_jobs.csv", has_location=False)  # File with 2 columns
    insert_jobs_from_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_anapec_jobs.csv", has_location=True)   # File with 3 columns

except Exception as e:
    print("❌ Error:", e)

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
    print("✅ Database connection closed.")
