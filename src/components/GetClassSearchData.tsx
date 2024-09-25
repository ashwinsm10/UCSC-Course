import { Class, SEARCH_API_URL } from "../types/Types";

export const fetchClassesBySubjectAndNumber = async (
    subject: string,
    number: string,
    quarter: string
  ): Promise<Class[]> => {
    const response = await fetch(
      `${SEARCH_API_URL}/${quarter}?subject=${subject}&catalog_nbr=${number}`
    );
    const data = await response.json();
    return data?.classes?.filter((classItem: Class) => classItem.catalog_nbr === number) || [];
  };
  
  export const fetchClassesByTitle = async (
    title: string,
    quarter: string
  ): Promise<Class[]> => {
    const response = await fetch(`${SEARCH_API_URL}/${quarter}?title=${title}`);
    const data = await response.json();
    return data.classes || [];
  };