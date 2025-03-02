import os
import psycopg2
from flask import Flask, jsonify

app = Flask(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL is not set in the environment variables.")
    return psycopg2.connect(DATABASE_URL, sslmode="require")

@app.route("/jobs", methods=["GET"])
def get_jobs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_offers")
        jobs = cursor.fetchall()
        cursor.close()
        conn.close()
        job_list = [{"id": job[0], "job_title": job[1], "city": job[2], "job_link": job[3], "source": job[4]} for job in jobs]
        return jsonify(job_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))

