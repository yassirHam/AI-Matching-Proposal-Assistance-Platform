# AI-Matching-Proposal-Assistance-Platform
# AI Job Matching & Proposal Assistance  

This project is a **job matching platform** that helps small businesses find employees or interns based on specific qualities and assists job seekers in finding opportunities suited to their skills.  

## Features  
✅ **Web Scraping** – Collect job listings from external sources  
✅ **Database Management** – Store job data in **MySQL**  
✅ **REST API** – Retrieve job offers via **Flask API**  
✅ **AI Assistance** – Enhance CV writing and job recommendations  

## Technologies Used  
- **Python** (Flask, MySQL Connector, Pandas)  
- **MySQL** (Database Management)  
- **Web Scraping** (BeautifulSoup, Selenium)  
- **Postman** (API Testing)  
- **Render** (Backend Deployment)  

## Installation  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/yassirHam/AI-Matching-Proposal-Assistance-Platform.git
cd your-repo
python -m venv .venv
source .venv/bin/activate   # On macOS/Linux
.venv\Scripts\activate      # On Windows
pip install -r requirements.txt


API Endpoints
Method	Endpoint	Description
GET	/jobs	Fetch all job offers
POST	/add-job	Add a new job (if needed)


