import os
import psycopg2
from flask import Flask, jsonify

app = Flask(__name__)

def get_db_connection():
    DATABASE_URL = os.getenv("postgresql://job_db_her2_user:Oy5zHIS9rVAbnpbJUUifhmf2cWFo5YZ1@dpg-cv16da9opnds73fev76g-a/job_db_her2")
    if not DATABASE_URL:
        raise Exception("DATABASE_URL environment variable not set!")
    return psycopg2.connect(DATABASE_URL, sslmode="require")

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Job API!"})

@app.route("/jobs", methods=["GET"])
def get_jobs():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM job_offers")
    jobs = cursor.fetchall()

    job_list = []
    for job in jobs:
        job_list.append({
            "job_title": job[0],
            "city": job[1],
            "job_link": job[2],
            "source": job[3]
        })

    cursor.close()
    conn.close()
    return jsonify(job_list)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
