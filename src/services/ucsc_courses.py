from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from src.services.course import Course
import concurrent.futures
import threading
import time

class WebDriverManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.driver_pool = []
        self.max_drivers = 10

    def get_driver(self):
        with self.lock:
            if self.driver_pool:
                return self.driver_pool.pop()
            elif len(self.driver_pool) < self.max_drivers:
                return self.create_driver()
            else:
                return None

    def create_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--headless")
        return webdriver.Chrome(options=chrome_options)

    def return_driver(self, driver):
        with self.lock:
            if len(self.driver_pool) < self.max_drivers:
                self.driver_pool.append(driver)
            else:
                driver.quit()

    def close_all(self):
        with self.lock:
            for driver in self.driver_pool:
                driver.quit()
            self.driver_pool.clear()

driver_manager = WebDriverManager()

def process_page(driver, class_list):
    try:
        class_rows = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'div.panel.panel-default.row'))
        )

        for row in class_rows:
            link_element = row.find_element(By.TAG_NAME, 'a')
            link_url = link_element.get_attribute('href')  

            link_text = link_element.text.split("   ")
            class_code = link_text[0]
            class_name = link_text[1] if len(link_text) > 1 else ""

            enroll_num = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3')[0]
            enroll_num = enroll_num.text.replace("Class Number: ","")

            teacher_div = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3')[1]
            teacher_name = teacher_div.text.replace('\n', ' ')
            teacher_name = teacher_name.replace('Instructor: ', '')

            names = teacher_name.split(",")
            teacher_name = names[1].strip() + " " + names[0].strip() if len(names) > 1 else teacher_name

            class_div = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3.hide-print')[2]
            class_type = class_div.text.replace('\n', ' ')
            class_type = class_type.replace("Instruction Mode: ","")

            class_count = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3')[2].text
            enrolled, total = map(int, class_count.split(" ")[0:3:2])
            class_count = f"{total - enrolled}/{total}"

            schedule_div = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-6')[1]
            schedule = schedule_div.text.replace('\n',' ')
            schedule = schedule.replace("Day and Time: ","")

            location_div = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-6')[0]
            location = location_div.text.replace('\n',' ')
            location = location.replace("Location: ","")

            class_list.append(Course(
                code=class_code,
                name=class_name,
                instructor=teacher_name,
                link=link_url, 
                class_count=class_count,
                enroll_num=enroll_num,
                class_type=class_type,
                schedule=schedule,
                location=location
            ))

        return True
    except Exception as e:
        print(f"Error processing page: {e}")
        return False

def scrape_courses(ge_choice):
    driver = None
    class_list = []

    try:
        driver = driver_manager.get_driver()
        if not driver:
            print(f"No available driver for {ge_choice}. Skipping.")
            return []

        driver.get("https://pisa.ucsc.edu/class_search/index.php")

        term_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'term_dropdown'))
        )
        selected_option = term_dropdown.find_element(By.CSS_SELECTOR, 'option:checked')
        print(f"Current Quarter: {selected_option.text}")

        ge_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'ge'))
        )
        ge_dropdown.click()
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//option[@value='{ge_choice}']"))
        ).click()

        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//input[@type='submit' and @value='Search']"))
        )
        submit_button.click()

        while True:
            if not process_page(driver, class_list):
                break

            try:
                next_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//a[contains(@onclick, 'next')]"))
                )
                next_button.click()
            except Exception:
                break  

    except Exception as e:
        print(f"An error occurred while scraping {ge_choice}: {e}")
    finally:
        if driver:
            driver_manager.return_driver(driver)

    return class_list

def get_courses(ge_choices):
    all_courses = []
    max_retries = 3
    retry_delay = 5  

    with concurrent.futures.ThreadPoolExecutor(max_workers=driver_manager.max_drivers) as executor:
        future_to_ge = {executor.submit(scrape_courses, ge): ge for ge in ge_choices}
        for future in concurrent.futures.as_completed(future_to_ge):
            ge = future_to_ge[future]
            for attempt in range(max_retries):
                try:
                    courses = future.result()
                    all_courses.extend(courses)
                    print(f"Finished scraping {ge} courses. Total courses: {len(courses)}")
                    break
                except Exception as exc:
                    print(f'{ge} generated an exception on attempt {attempt + 1}: {exc}')
                    if attempt < max_retries - 1:
                        print(f"Retrying {ge} in {retry_delay} seconds...")
                        time.sleep(retry_delay)
                    else:
                        print(f"Failed to scrape {ge} after {max_retries} attempts.")

    driver_manager.close_all()
    return all_courses

if __name__ == "__main__":
    ge_choices = ["CC", "ER", "IM", "MF", "SI", "SR", "TA", "PE-E", "PE-H", "PE-T", "PR-E", "PR-C", "PR-S", "C1", "C2"]
    courses = get_courses(ge_choices)
    print(f"Total courses scraped: {len(courses)}")