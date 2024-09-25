// services/apiService.js
import { API_URL, LAST_UPDATE_URL } from "@/types/Types";
import axios from "axios";

export const fetchCourses = async (categoryValue: string) => {
  try {
    const response = await axios.get(`${API_URL}?course=${categoryValue}`);
    return response.data?.data || [];
  } catch (err) {
    console.error("Error fetching data:", err);
    throw new Error("Error loading data. Please try again later.");
  }
};

export const fetchLastUpdate = async () => {
  try {
    const response = await axios.get(LAST_UPDATE_URL);

    // Assuming the response gives you an ISO string (as per your backend), parse it as a Date object
    const lastUpdate = new Date(response.data.last_update);

    // If there's no valid last update, return an empty string
    return lastUpdate || "";
  } catch (err) {
    console.error("Error fetching last update time:", err);
    throw new Error("Error loading last update time.");
  }
};
export const getTimeAgo = (lastUpdate?: Date) => {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

  if (isNaN(secondsAgo)) {
    return "Invalid date"; // Handle invalid date parsing
  }

  if (secondsAgo < 60) {
    return `${secondsAgo}s ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return `${hoursAgo}h ago`;
  } else {
    const daysAgo = Math.floor(secondsAgo / 86400);
    return `${daysAgo}d ago`;
  }
};
