export const courseCategories = [
  { value: "CC", label: "Cross-Cultural Analysis" },
  { value: "ER", label: "Ethnicity and Race" },
  { value: "IM", label: "Interpreting Arts and Media" },
  { value: "MF", label: "Mathematical and Formal..." },
  { value: "SI", label: "Scientific Inquiry" },
  { value: "SR", label: "Statistical Reasoning" },
  { value: "TA", label: "Textual Analysis" },
  { value: "PE-E", label: "Perspectives: Environmental..." },
  { value: "PE-H", label: "Perspectives: Human Behavior" },
  { value: "PE-T", label: "Perspectives: Technology..." },
  { value: "PR-E", label: "Practice: Collaborative En..." },
  { value: "PR-C", label: "Practice: Creative Process" },
  { value: "PR-S", label: "Practice: Service Learning" },
  { value: "C1", label: "Composition 1" },
  { value: "C2", label: "Composition 2" },
  { value: "AnyGE", label: "All Courses" },
];

export interface Instructor {
  cruzid: string;
  name: string;
}



export const customCategoryOrder = [
  "Major Qualification",
  "Lower-Division Courses",
  "Upper-Division Courses",
  "Electives",
  "Disciplinary Communications (DC) Requirements",
];

export interface Class {
  strm: string;
  class_nbr: string;
  class_section: string;
  session_code: string;
  class_status: string;
  subject: string;
  catalog_nbr: string;
  title: string;
  title_long: string;
  component: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_days: string;
  enrl_status: string;
  waitlist_total: string;
  enrl_capacity: string;
  enrl_total: string;
  instructors: Instructor[];
}
const local = "http://192.168.0.198:5001";
const heroku_url = "https://web-production-04ff.up.railway.app";
const current_url = local;
export const API_URL = `${current_url}/api/courses`;
export const LAST_UPDATE_URL = `${current_url}/api/last_update`;
export const SEARCH_API_URL =
  "https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1";
export const MAJOR_API_URL = `${current_url}/api/courses`;
export const DEGREE_API_URL = `${current_url}/api/degrees`
export interface Course {
  code: string;
  link: string;
  enroll_num: string;
  name: string;
  instructor: string;
  class_count: string;
  class_type: string;
  ge: string;
  schedule: string;
  location: string;
}
