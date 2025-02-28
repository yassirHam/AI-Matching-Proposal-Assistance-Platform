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
options.headless = True  # Run in background
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

base_url = "https://www.je-recrute.com/category/maroc-job/"
driver.get(base_url)

all_jobs = set()
visited_pages = set()
while True:
    current_url = driver.current_url
    print(f"🔄 Scraping: {current_url}")

    if current_url in visited_pages:
        print("⚠️ Duplicate page detected. Stopping...")
        break

    visited_pages.add(current_url)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "td-module-title"))
        )
    except Exception as e:
        print("❌ Job listings did not load. Stopping...", e)
        break

    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")

    jobs = soup.find_all("h3", class_="entry-title td-module-title")

    if not jobs:
        print("❌ No more jobs found. Stopping...")
        break

    print(f"✅ Found {len(jobs)} job listings on this page.")

    for job in jobs:
        link_tag = job.find("a", href=True)
        job_title = link_tag.text.strip() if link_tag else "No Title"
        job_link = link_tag["href"] if link_tag else "No Link"

        if (job_title, job_link) not in all_jobs:
            all_jobs.add((job_title, job_link))
            print(f"📌 {job_title} ➝ {job_link}")
    next_link = soup.find("link", rel="next")
    if next_link and next_link.get("href"):
        next_page_url = next_link["href"]
        if next_page_url not in visited_pages:
            print(f"➡ Moving to next page: {next_page_url}")
            driver.get(next_page_url)
            time.sleep(3)
        else:
            print("⚠️ Already visited this page. Stopping...")
            break
    else:
        print("✅ No more pages. Stopping...")
        break

driver.quit()

with open("je_recrute_jobs.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Job Title", "Job Link"])
    writer.writerows(all_jobs)

print(f"✅ Scraped {len(all_jobs)} jobs across multiple pages. Saved to je_recrute_jobs.csv!")
