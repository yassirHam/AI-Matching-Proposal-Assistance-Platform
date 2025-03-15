import psycopg2
import csv
import pandas as pd

DATABASE_URL = "postgresql://postgres:zOFKgEWJINuNBnzzLrdRwQTcbCZeYmCZ@crossover.proxy.rlwy.net:25810/railway"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    print("✅ Connected successfully!")

    # Updated table structure
    create_table_query = """
    CREATE TABLE IF NOT EXISTS job (
        id SERIAL PRIMARY KEY,
        job_title TEXT NOT NULL,
        city TEXT NOT NULL,
        job_link TEXT NOT NULL,
        source TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        company_id INTEGER
    );
    """
    cursor.execute(create_table_query)
    conn.commit()
    print("✅ Table 'job' is ready.")


    def insert_jobs_from_csv(csv_file_path):
        """Insert job data from CSV into the database"""
        with open(csv_file_path, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            insert_query = """
                INSERT INTO job (job_title, city, job_link, source, company_id)
                VALUES (%(job_title)s, %(city)s, %(job_link)s, %(source)s, %(company_id)s)
            """
            job_data = []

            for row in reader:
                # Convert empty company_id to NULL
                if row['company_id'] == '':
                    row['company_id'] = None
                job_data.append(row)

            cursor.executemany(insert_query, job_data)
            conn.commit()
            print(f"✅ Inserted {len(job_data)} jobs from {csv_file_path}")


    '''def clean_data():
        """Clean and normalize CSV data"""
        # Process Anapec data
        df_anapec = pd.read_csv("anapec_jobs.csv")
        df_anapec = df_anapec.rename(columns={
            'Job Title': 'job_title',
            'Job Location': 'city',
            'Job Link': 'job_link'
        })
        df_anapec['source'] = 'Anapec'
        df_anapec['company_id'] = None  # Default to NULL
        df_anapec['job_title'] = df_anapec['job_title'].str.title()
        df_anapec['city'] = df_anapec['city'].str.title()

        # Process JeRecrute data
        df_je_recrute = pd.read_csv("je_recrute_jobs.csv")
        df_je_recrute = df_je_recrute.rename(columns={
            'Job Title': 'job_title',
            'Job Link': 'job_link'
        })
        df_je_recrute['source'] = 'JeRecrute'
        df_je_recrute['city'] = 'Not Specified'
        df_je_recrute['company_id'] = None  # Default to NULL
        df_je_recrute['job_title'] = df_je_recrute['job_title'].str.title()

        # Save cleaned data
        df_anapec.to_csv("clean_anapec_jobs.csv", index=False)
        df_je_recrute.to_csv("clean_je_recrute_jobs.csv", index=False)
        print("✅ Anapec and JeRecrute data cleaned and saved!")'''


    def clean_linkedin_data():
        """Clean LinkedIn posts data"""
        df_linkedin = pd.read_csv("linkedin_posts.csv")
        df_linkedin = df_linkedin.rename(columns={
            'Post Text': 'job_title',
            'Post Link': 'job_link'
        })
        df_linkedin['source'] = 'LinkedIn'
        df_linkedin['city'] = 'Not Specified'
        df_linkedin['company_id'] = None
        df_linkedin['job_title'] = df_linkedin['job_title'].str.title()
        df_linkedin.to_csv("clean_linkedin_posts.csv", index=False)
        print("✅ LinkedIn data cleaned and saved!")


    # Data processing pipeline
    '''clean_data()'''
    clean_linkedin_data()

    # Insert cleaned data
    '''insert_jobs_from_csv("clean_je_recrute_jobs.csv")
    insert_jobs_from_csv("clean_anapec_jobs.csv")'''
    insert_jobs_from_csv("clean_linkedin_posts.csv")

except Exception as e:
    print("❌ Error:", e)

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
    print("✅ Database connection closed.")