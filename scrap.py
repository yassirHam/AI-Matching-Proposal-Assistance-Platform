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

def create_driver(headless=True):
    options = Options()
    if headless:
        options.add_argument("--headless")
    service = Service(ChromeDriverManager().install())  # Automatically downloads the correct driver
    return webdriver.Chrome(service=service, options=options)

def scrape_anapec():
    driver = create_driver(headless=False)
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

def scrape_je_recrute():
    driver = create_driver(headless=True)
    base_url = "https://www.je-recrute.com/category/maroc-job/"
    driver.get(base_url)
    all_jobs = set()

    while True:
        print(f"🔄 Scraping Je-Recrute: {driver.current_url}")
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "td-module-title"))
            )
        except:
            print("❌ Job listings did not load. Stopping...")
            break

        html = driver.page_source
        soup = BeautifulSoup(html, "html.parser")
        jobs = soup.find_all("h3", class_="entry-title td-module-title")
        if not jobs:
            break

        for job in jobs:
            link_tag = job.find("a", href=True)
            job_title = link_tag.text.strip() if link_tag else "No Title"
            job_link = link_tag["href"] if link_tag else "No Link"
            all_jobs.add((job_title, job_link))

        next_link = soup.find("link", rel="next")
        if next_link and next_link.get("href"):
            driver.get(next_link["href"])
            time.sleep(3)
        else:
            break

    driver.quit()
    with open("je_recrute_jobs.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Job Title", "Job Link"])
        writer.writerows(all_jobs)
    print(f"✅ Scraped {len(all_jobs)} jobs from Je-Recrute. Saved to je_recrute_jobs.csv!")

if __name__ == "__main__":
    scrape_anapec()
    scrape_je_recrute()