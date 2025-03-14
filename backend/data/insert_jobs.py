import psycopg2
import csv

DATABASE_URL = "postgresql://postgres:zOFKgEWJINuNBnzzLrdRwQTcbCZeYmCZ@crossover.proxy.rlwy.net:25810/railway"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    print("✅ Connected successfully!")

    create_table_query = """
    CREATE TABLE IF NOT EXISTS job (
        id SERIAL PRIMARY KEY,
        job_title TEXT NOT NULL,
        city TEXT NOT NULL,
        job_link TEXT NOT NULL,
        source TEXT NOT NULL
    );
    """
    cursor.execute(create_table_query)
    conn.commit()
    print("✅ Table 'job' is ready.")

    def insert_jobs_from_csv(csv_file_path, has_location):
        """Insert job data from CSV into the database"""
        with open(csv_file_path, mode="r", encoding="utf-8") as file:
            reader = csv.reader(file)
            next(reader)

            insert_query = "INSERT INTO job (job_title, city, job_link, source) VALUES (%s, %s, %s, %s);"
            job_data = []

            for row in reader:
                job_title = row[0]
                job_link = row[1] if len(row) > 1 else "No Link"
                city = row[2] if has_location and len(row) > 2 else "Unknown"
                source = "CSV Import"

                job_data.append((job_title, city, job_link, source))

            cursor.executemany(insert_query, job_data)
            conn.commit()
            print(f"✅ Inserted {len(job_data)} jobs from {csv_file_path}")

    def insert_linkedin_posts(csv_file_path):
        """Insert LinkedIn posts data into the database"""
        with open(csv_file_path, mode="r", encoding="utf-8") as file:
            reader = csv.reader(file)
            next(reader)
            insert_query = "INSERT INTO job (job_title, city, job_link, source) VALUES (%s, %s, %s, %s);"
            post_data = []

            for row in reader:
                post_text = row[0]
                city = "Unknown"
                job_link = "No Link"
                source = "LinkedIn"

                post_data.append((post_text, city, job_link, source))

            cursor.executemany(insert_query, post_data)
            conn.commit()
            print(f"✅ Inserted {len(post_data)} LinkedIn posts from {csv_file_path}")

    insert_jobs_from_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_je_recrute_jobs.csv", has_location=False)  # File with 2 columns
    insert_jobs_from_csv("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_anapec_jobs.csv", has_location=True)   # File with 3 columns
    insert_linkedin_posts("C:\\Users\\yassi\\PycharmProjects\\WebScraping\\data\\clean_linkedin_posts.csv")

except Exception as e:
    print("❌ Error:", e)

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
    print("✅ Database connection closed.")