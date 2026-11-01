import axios from "axios";

/**
 * In development the Vite proxy forwards /api to the Express server, so no
 * environment file is needed. In production set VITE_API_URL to the deployed
 * API base including the /api prefix, e.g.
 * https://student-management-api.onrender.com/api
 */
const baseURL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const fetchStudents = async () => {
  const response = await api.get("/students");
  return response.data.data;
};

export const createStudent = async (student) => {
  const response = await api.post("/students", student);
  return response.data.data;
};

export const updateStudent = async (id, student) => {
  const response = await api.put(`/students/${encodeURIComponent(id)}`, student);
  return response.data.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${encodeURIComponent(id)}`);
  return response.data.data;
};

/**
 * Turns any API/network failure into a single readable message.
 * Field level errors from the backend are joined for display.
 */
export const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
  if (error?.response?.data) {
    const { message, errors } = error.response.data;

    if (Array.isArray(errors) && errors.length > 0) {
      return errors.map((item) => item.message).join(" ");
    }

    if (message) return message;
  }

  if (error?.code === "ECONNABORTED") {
    return "The server took too long to respond. Please try again.";
  }

  if (!error?.response) {
    return "Unable to reach the API. Make sure the backend server is running.";
  }

  return fallback;
};

export default api;
