from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="iry999",
    database="job_db"
)
@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Job API!"})

@app.route("/jobs", methods=["GET"])
def get_jobs():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM job_offers")
    jobs = cursor.fetchall()
    cursor.close()
    return jsonify(jobs)

if __name__ == "__main__":
    app.run(debug=True)
