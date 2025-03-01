from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        user="postgres",
        password="iryeli999",
        database="job_db"
    )

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
    app.run(debug=True)
