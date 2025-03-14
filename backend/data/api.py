import os
import psycopg2
from flask import Flask, jsonify
from waitress import serve
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:zOFKgEWJINuNBnzzLrdRwQTcbCZeYmCZ@crossover.proxy.rlwy.net:25810/railway")


def get_db_connection():
    try:
        logging.debug("Connecting to the database...")
        conn = psycopg2.connect(DATABASE_URL, sslmode="require")
        logging.debug("Database connection successful.")
        return conn
    except Exception as e:
        logging.error(f"❌ Database connection failed: {e}")
        raise


@app.route("/api/v1/jobs", methods=["GET"])
def get_jobs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        logging.debug("Executing query...")
        cursor.execute("SELECT * FROM job")

        logging.debug("Fetching results...")
        jobs = cursor.fetchall()

        cursor.close()
        conn.close()
        logging.debug("Database connection closed.")

        return jsonify([
            {"id": job[0], "job_title": job[1], "city": job[2], "job_link": job[3], "source": job[4]}
            for job in jobs
        ])
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    logging.debug("Starting application...")
    serve(app, host="0.0.0.0", port=5000)