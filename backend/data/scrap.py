from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import logging
import csv
from time import sleep

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_driver(headless=True):
    """Create and configure a Selenium WebDriver."""
    options = Options()
    if headless:
        options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)

def scrape_linkedin_posts(driver, email, password):
    """Scrape LinkedIn posts and save them to a CSV file."""
    logging.info("🔄 Logging into LinkedIn...")
    login_url = "https://www.linkedin.com/login"
    driver.get(login_url)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "username")))
    driver.find_element(By.ID, "username").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "password").submit()

    sleep(5)
    if "captcha" in driver.page_source.lower() or "challenge" in driver.current_url:
        logging.warning("CAPTCHA or additional verification detected. Please solve it manually.")
        input("Press Enter after solving the CAPTCHA...")

    logging.info("🔄 Scraping LinkedIn posts...")
    posts_url = "https://www.linkedin.com/company/stages-portal/posts/"
    driver.get(posts_url)
    sleep(5)

    all_posts = []
    current_page = 1

    while True:
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "occludable-update"))
            )
        except Exception as e:
            logging.error(f"❌ Failed to load posts: {e}")
            break

        html = driver.page_source
        soup = BeautifulSoup(html, "html.parser")

        posts = soup.find_all("div", class_="occludable-update")
        if not posts:
            logging.info("✅ No more posts found. Stopping...")
            break

        logging.info(f"✅ Found {len(posts)} posts on page {current_page}.")

        for post in posts:
            spans = post.find_all("span", dir="ltr")
            post_text = " ".join(
                span.get_text(separator=" ").strip() for span in spans if "Stages Portal" not in span.get_text()
            )
            post_link_tag = post.find("a", href=True)
            post_link = post_link_tag["href"] if post_link_tag else "No Link"
            if post_link and not post_link.startswith("http"):
                post_link = f"https://www.linkedin.com{post_link}"

            if post_text:
                all_posts.append((post_text, "", post_link, "LinkedIn", 1))  # Format for database
                logging.info(f"📌 Extracted post: {post_text[:60]}... ➝ {post_link}")

        try:
            next_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Next']")
            if "disabled" in next_button.get_attribute("class"):
                logging.info("✅ No more pages. Stopping...")
                break
            else:
                next_button.click()
                sleep(5)
                current_page += 1
        except Exception as e:
            logging.info("✅ No more pages or 'Next' button not found. Trying infinite scroll...")
            try:
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                sleep(3)
                new_posts = driver.find_elements(By.CLASS_NAME, "occludable-update")
                if len(new_posts) <= len(posts):
                    logging.info("✅ No more posts loaded. Stopping...")
                    break
            except Exception as e:
                logging.error(f"❌ Failed to scroll or load more posts: {e}")
                break

    with open("linkedin_posts.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["job_title", "city", "job_link", "source", "company_id"])  # Updated headers
        writer.writerows(all_posts)

    logging.info(f"✅ Scraped {len(all_posts)} LinkedIn posts. Saved to linkedin_posts.csv!")

def scrape_anapec():
    """Scrape job listings from Anapec and save them to a CSV file."""
    driver = create_driver(headless=False)
    base_url = "https://anapec.ma/home-page-o1/chercheur-emploi/offres-demploi/"
    driver.get(base_url)

    all_jobs = []
    current_page = 1

    while True:
        logging.info(f"🔄 Scraping Anapec page {current_page}...")

        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "offre"))
            )
        except:
            logging.error("❌ Job listings did not load. Stopping...")
            break

        html = driver.page_source
        soup = BeautifulSoup(html, "html.parser")

        jobs = soup.find_all("div", class_="offre")
        if not jobs:
            logging.info("✅ No more job listings found. Stopping...")
            break

        logging.info(f"✅ Found {len(jobs)} job listings on page {current_page}.")

        for job in jobs:
            link_tag = job.find("a", href=True)
            title_tag = job.find("h3", class_="mb-2")
            location_tag = job.find("h3", class_="offre-subtitle")

            job_link = link_tag["href"] if link_tag else "No Link"
            if not job_link.startswith("http"):
                job_link = f"https://anapec.ma{job_link}"

            job_title = title_tag.text.strip() if title_tag else "No Title"
            job_location = location_tag.text.strip() if location_tag else "No Location"

            all_jobs.append((job_title, job_location, job_link, "Anapec", None))  # Format for database
            logging.info(f"📌 {job_title} ➝ {job_link} - 📍 {job_location}")

        next_page_link = soup.find("a", href=True, string="Suivant")  # Find "Next" button
        if not next_page_link:
            next_page_link = soup.find("a", href=lambda href: href and "?pg=" in href and f"?pg={current_page + 1}" in href)

        if next_page_link:
            next_page_url = f"https://anapec.ma{next_page_link['href']}"
            logging.info(f"➡ Moving to page {current_page + 1}: {next_page_url}")
            driver.get(next_page_url)
            sleep(3)
            current_page += 1
        else:
            logging.info("✅ No more pages. Stopping...")
            break

    driver.quit()

    with open("anapec_jobs.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["job_title", "city", "job_link", "source", "company_id"])  # Updated headers
        writer.writerows(all_jobs)

    logging.info(f"✅ Scraped {len(all_jobs)} Anapec jobs. Saved to anapec_jobs.csv!")

def scrape_je_recrute():
    """Scrape job listings from JeRecrute and save them to a CSV file."""
    driver = create_driver(headless=True)
    base_url = "https://www.je-recrute.com/category/maroc-job/"
    driver.get(base_url)
    all_jobs = set()

    while True:
        logging.info(f"🔄 Scraping Je-Recrute: {driver.current_url}")
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "td-module-title"))
            )
        except:
            logging.error("❌ Job listings did not load. Stopping...")
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
            all_jobs.add((job_title, "", job_link, "JeRecrute", None))  # Format for database

        next_link = soup.find("link", rel="next")
        if next_link and next_link.get("href"):
            driver.get(next_link["href"])
            sleep(3)
        else:
            break

    driver.quit()

    with open("je_recrute_jobs.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["job_title", "city", "job_link", "source", "company_id"])  # Updated headers
        writer.writerows(all_jobs)

    logging.info(f"✅ Scraped {len(all_jobs)} JeRecrute jobs. Saved to je_recrute_jobs.csv!")

if __name__ == "__main__":
    email_input = input("Enter your LinkedIn email: ")
    password_input = input("Enter your LinkedIn password: ")
    scrape_linkedin_posts(create_driver(headless=False), email_input, password_input)

    scrape_anapec()

    scrape_je_recrute()