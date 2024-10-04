import requests
from bs4 import BeautifulSoup
from contextlib import closing

def scrape_links_excluding_breadcrumb(base_url, section_id, breadcrumb_id):
    with closing(requests.get(base_url, stream=True)) as response:
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

    section = soup.find(id=section_id)
    
    if not section:
        print(f'Section with id="{section_id}" not found.')
        return []

    breadcrumb = section.find(id=breadcrumb_id)
    
    links = []

    for link in section.find_all('a'):
        if breadcrumb and link in breadcrumb.find_all('a'):
            continue
        href = link.get('href')
        text = link.get_text(strip=True)
        if href:
            full_url = "https://catalog.ucsc.edu/" + href + "#degree-req-2"
            links.append((full_url, text))

    return links

def main():
    base_url = 'https://catalog.ucsc.edu/en/current/general-catalog/academic-programs/bachelors-degrees/'
    section_id = 'main'
    breadcrumb_id = 'breadcrumb'
    
    try:
        links = scrape_links_excluding_breadcrumb(base_url, section_id, breadcrumb_id)
        return links
    except requests.RequestException as e:
        print(f"An error occurred while fetching the page: {e}")
        return []

if __name__ == '__main__':
    main()