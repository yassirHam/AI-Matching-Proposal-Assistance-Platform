from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

def get_db_connection():
    DATABASE_URL = "postgresql://job_db_her2_user:Oy5zHIS9rVAbnpbJUUifhmf2cWFo5YZ1@dpg-cv16da9opnds73fev76g-a/job_db_her2"
    return psycopg2.connect(DATABASE_URL, sslmode="require")

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Job API!"})

@app.route("/jobs", methods=["GET"])
def get_jobs():
    try:
        print("Connecting to database...")  # Debugging
        conn = get_db_connection()
        print("Database connected!")  # Debugging

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
        print("Returning job list...")  # Debugging
        return jsonify(job_list)

    except Exception as e:
        print(f"Error fetching jobs: {e}")  # Debugging
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
