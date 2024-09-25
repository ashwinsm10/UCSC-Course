import requests
from bs4 import BeautifulSoup

def scrape_links_excluding_breadcrumb(base_url, section_id, breadcrumb_id):
    response = requests.get(base_url)
    soup = BeautifulSoup(response.content, 'html.parser')

    section = soup.find(id=section_id)
    
    if not section:
        print(f'Section with id="{section_id}" not found.')
        return []

    breadcrumb = section.find(id=breadcrumb_id)
    
    links = []

    all_links = section.find_all('a')
    for link in all_links:
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
    
    links = scrape_links_excluding_breadcrumb(base_url, section_id, breadcrumb_id)

    
    return links

if __name__ == '__main__':
    main()