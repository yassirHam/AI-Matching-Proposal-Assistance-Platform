import os
import psycopg2
from flask import Flask, jsonify
from waitress import serve

app = Flask(__name__)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:zOFKgEWJINuNBnzzLrdRwQTcbCZeYmCZ@postgres.railway.internal:5432/railway")

def get_db_connection():
    try:
        return psycopg2.connect(DATABASE_URL, sslmode="require")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

@app.route("/api/v1/jobs", methods=["GET"])
def get_jobs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job")
        jobs = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify([
            {"id": job[0], "job_title": job[1], "city": job[2], "job_link": job[3], "source": job[4]}
            for job in jobs
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8000)