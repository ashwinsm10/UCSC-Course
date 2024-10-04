import gc
from src.services.major_links import main as get_links_from_major_links
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

COURSE_TYPE_ORDER = [
    "Major Qualification",
    "Lower-Division Courses",
    "Upper-Division Courses",
    "Electives",
    "Disciplinary Communications (DC) Requirements"
]

def scrape_courses_from_page(page_url):
    response = requests.get(page_url)
    soup = BeautifulSoup(response.content, 'html.parser')

    courses_by_type = {}

    course_types = soup.find_all('h4', class_='sc-RequiredCoursesHeading2')

    for course_type in course_types:
        course_type_text = course_type.get_text(strip=True)

        next_element = course_type.find_next_sibling()

        course_list = []

        while next_element and next_element.name != 'h4':
            course_links = next_element.find_all('a', class_='sc-courselink')

            for link in course_links:
                if link.get_text(strip=True) not in course_list and link.get_text(strip=True) != "":
                    course_list.append(link.get_text(strip=True))

            next_element = next_element.find_next_sibling()

        if course_list:
            courses_by_type[course_type_text] = course_list

    del soup
    gc.collect()

    return courses_by_type

def sort_course_types(course_types):
    return sorted(course_types.keys(), key=lambda x: (
        COURSE_TYPE_ORDER.index(x) if x in COURSE_TYPE_ORDER else len(COURSE_TYPE_ORDER)
    ))

def fetch_courses_for_degree(link):
    degree_url, degree_name = link
    print(f'Scraping courses from: {degree_name}')
    courses = scrape_courses_from_page(degree_url)
    return degree_name, courses

def process_degree_courses(degree_name, courses):
    sorted_course_types = sort_course_types(courses)
    sorted_courses_by_type = {course_type: courses[course_type] for course_type in sorted_course_types}

    for course_type, course_list_for_type in sorted_courses_by_type.items():
        print(f'\nCourse Type: {course_type}')
        for course in course_list_for_type:
            print(f'  Course: {course}')
        print('-' * 40)

    del courses
    gc.collect()

    return {degree_name: sorted_courses_by_type}

def get_all_major_courses():
    links = get_links_from_major_links()
    course_list = {}

    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_degree = {executor.submit(fetch_courses_for_degree, link): link[1] for link in links}

        for future in as_completed(future_to_degree):
            degree_name = future_to_degree[future]
            try:
                _, courses = future.result()
                degree_courses = process_degree_courses(degree_name, courses)
                course_list.update(degree_courses)

                del courses
                gc.collect()

            except Exception as exc:
                print(f'{degree_name} generated an exception: {exc}')

    return course_list

if __name__ == '__main__':
    result = get_all_major_courses()
    print(f"Total number of majors processed: {len(result)}")