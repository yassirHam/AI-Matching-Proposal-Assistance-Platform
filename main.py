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
import pandas as pd

def create_driver(headless=True):
    options = Options()
    options.headless = headless
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)

def scrape_anapec():
    driver = create_driver(headless=False)
    base_url = "https://anapec.ma/home-page-o1/chercheur-emploi/offres-demploi/"
    driver.get(base_url)
    all_jobs = []
    current_page = 1

    while True:
        print(f"🔄 Scraping Anapec page {current_page}...")
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
            print("✅ No more job listings found on Anapec. Stopping...")
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

        next_page_link = soup.find("a", href=True, string="Suivant")
        if not next_page_link:
            next_page_link = soup.find("a",
                                       href=lambda href: href and "?pg=" in href and f"?pg={current_page + 1}" in href)

        if next_page_link:
            next_page_url = f"https://anapec.ma{next_page_link['href']}"
            print(f"➡ Moving to page {current_page + 1}: {next_page_url}")
            driver.get(next_page_url)
            time.sleep(3)
            current_page += 1
        else:
            print("✅ No more pages on Anapec. Stopping...")
            break

    driver.quit()
    with open("anapec_jobs.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Job Title", "Job Link", "Job Location"])
        writer.writerows(all_jobs)
    print(f"✅ Scraped {len(all_jobs)} jobs from Anapec. Saved to anapec_jobs.csv!")

def scrape_je_recrute():
    driver = create_driver(headless=True)
    base_url = "https://www.je-recrute.com/category/maroc-job/"
    driver.get(base_url)
    all_jobs = set()
    visited_pages = set()

    while True:
        current_url = driver.current_url
        print(f"🔄 Scraping Je-Recrute: {current_url}")
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
            print("❌ No more jobs found on Je-Recrute. Stopping...")
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
            print("✅ No more pages on Je-Recrute. Stopping...")
            break

    driver.quit()
    with open("je_recrute_jobs.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Job Title", "Job Link"])
        writer.writerows(all_jobs)
    print(f"✅ Scraped {len(all_jobs)} jobs from Je-Recrute. Saved to je_recrute_jobs.csv!")


def clean_data():

    df_anapec = pd.read_csv("anapec_jobs.csv")
    df_je_recrute = pd.read_csv("je_recrute_jobs.csv")

    df_anapec["Job Title"] = df_anapec["Job Title"].str.title()
    df_je_recrute["Job Title"] = df_je_recrute["Job Title"].str.title()

    if "Job Location" in df_anapec.columns:
        df_anapec["Job Location"] = df_anapec["Job Location"].str.title()

    df_anapec.drop_duplicates(inplace=True)
    df_je_recrute.drop_duplicates(inplace=True)

    df_anapec.fillna("Not specified", inplace=True)
    df_je_recrute.fillna("Not specified", inplace=True)

    # Save cleaned data
    df_anapec.to_csv("clean_anapec_jobs.csv", index=False)
    df_je_recrute.to_csv("clean_je_recrute_jobs.csv", index=False)

    print("✅ Data cleaned and saved!")

def main():
    scrape_anapec()
    scrape_je_recrute()
    clean_data()


if __name__ == "__main__":
    main()
