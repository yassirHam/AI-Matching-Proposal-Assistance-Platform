from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import csv

options = Options()
options.headless = False
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

base_url = "https://anapec.ma/home-page-o1/chercheur-emploi/offres-demploi/"
driver.get(base_url)

all_jobs = []
current_page = 1

while True:
    print(f"🔄 Scraping page {current_page}...")

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "offre"))
        )
    except:
        print("❌ Job listings did not load. Stopping...")
        break

    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")

    jobs = soup.find_all("div", class_="offre")
    if not jobs:
        print("✅ No more job listings found. Stopping...")
        break

    print(f"✅ Found {len(jobs)} job listings on page {current_page}.")

    for job in jobs:
        link_tag = job.find("a", href=True)
        title_tag = job.find("h3", class_="mb-2")
        location_tag = job.find("h3", class_="offre-subtitle")

        job_link = link_tag["href"] if link_tag else "No Link"
        if not job_link.startswith("http"):
            job_link = f"https://anapec.ma{job_link}"

        job_title = title_tag.text.strip() if title_tag else "No Title"
        job_location = location_tag.text.strip() if location_tag else "No Location"

        all_jobs.append((job_title, job_link, job_location))
        print(f"📌 {job_title} ➝ {job_link} - 📍 {job_location}")

    next_page_link = soup.find("a", href=True, string="Suivant")  # ✅ Find "Next" button
    if not next_page_link:
        next_page_link = soup.find("a", href=lambda href: href and "?pg=" in href and f"?pg={current_page + 1}" in href)

    if next_page_link:
        next_page_url = f"https://anapec.ma{next_page_link['href']}"
        print(f"➡ Moving to page {current_page + 1}: {next_page_url}")
        driver.get(next_page_url)
        time.sleep(3)
        current_page += 1
    else:
        print("✅ No more pages. Stopping...")
        break

driver.quit()

with open("anapec_jobs.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Job Title", "Job Link", "Job Location"])  # Write headers
    writer.writerows(all_jobs)

print(f"✅ Scraped {len(all_jobs)} jobs across multiple pages. Saved to anapec_jobs.csv!")
