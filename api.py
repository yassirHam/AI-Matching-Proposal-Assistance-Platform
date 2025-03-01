from flask import Flask, jsonify
import psycopg2
import psycopg2.extras

app = Flask(__name__)

DATABASE_URL = "postgresql://job_db_her2_user:Oy5zHIS9rVAbnpbJUUifhmf2cWFo5YZ1@dpg-cv16da9opnds73fev76g-a/job_db_her2"

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL, sslmode="require")
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

@app.route('/jobs', methods=['GET'])
def get_jobs():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        # Using DictCursor to access columns by name instead of index
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute("SELECT job_title, city, job_link, source FROM job_offers;")
            jobs = cursor.fetchall()

            job_list = []
            for job in jobs:
                job_list.append({
                    "job_title": job['job_title'],
                    "city": job['city'],
                    "job_link": job['job_link'],
                    "source": job['source']
                })

        return jsonify(job_list)

    except Exception as e:
        print(f"❌ Error fetching jobs: {e}")
        return jsonify({"error": "Failed to fetch jobs"}), 500

    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    # Disable debug mode for production use
    app.run(debug=False)