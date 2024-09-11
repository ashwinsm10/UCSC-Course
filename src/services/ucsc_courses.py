from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from src.services.course import Course

def process_page(driver, class_list):
    try:
        class_rows = WebDriverWait(driver, 1).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'div.panel.panel-default.row'))
        )

        for row in class_rows:
            link_element = row.find_element(By.TAG_NAME, 'a')
            link_url = link_element.get_attribute('href')  

            link_element = link_element.text.split("   ")
            class_code = link_element[0]
            class_name = link_element[1]


            enroll_num = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3')[0]
            teacher_div = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3')[1]
            teacher_name = teacher_div.text.replace('\n', ' ')
            teacher_name = teacher_name.replace('Instructor: ', '')

            names = teacher_name.split(",")
            teacher_name = names[1] + " " + names[0] if len(names) > 1 else teacher_name
            class_div = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3.hide-print')[2]
            class_type = class_div.text.replace('\n', ' ')
            class_type = class_type.replace("Instruction Mode: ","")

            class_count = row.find_elements(By.CSS_SELECTOR, 'div.col-xs-6.col-sm-3')[2]
            class_count = class_count.text.split(" ")[0] + "/" + class_count.text.split(" ")[2]


            class_list.append(Course(
                code=class_code,
                name=class_name,
                instructor=teacher_name,
                link=link_url, 
                class_count=class_count,
                enroll_num=enroll_num.text,
                class_type=class_type
                
            ))

        return True
    except Exception as e:
        print(f"Error processing page: {e}")
        return False

def get_courses(ge_choice):
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--headless")


    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://pisa.ucsc.edu/class_search/index.php")

    class_list = []
    

    try:
        term_dropdown = WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.ID, 'term_dropdown'))
        )
        selected_option = term_dropdown.find_element(By.CSS_SELECTOR, 'option:checked')
        print("Current Quarter:", selected_option.text)

        ge_dropdown = WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.ID, 'ge'))
        )
        ge_dropdown.click()
        WebDriverWait(driver, 2).until(
            EC.element_to_be_clickable((By.XPATH, f"//option[@value='{ge_choice}']"))
        ).click()

        submit_button = WebDriverWait(driver, 2).until(
            EC.element_to_be_clickable((By.XPATH, "//input[@type='submit' and @value='Search']"))
        )
        submit_button.click()

        while True:
            process_page(driver, class_list)

            try:
                next_button = WebDriverWait(driver, 0).until(
                    EC.element_to_be_clickable((By.XPATH, "//a[contains(@onclick, 'next')]"))
                )
                next_button.click()
            except Exception:
                break  

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        driver.quit()

    return class_list

if __name__ == "__main__":
    ge_choice = "CC"
    courses = get_courses(ge_choice)