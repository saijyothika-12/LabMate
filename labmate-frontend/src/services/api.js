const BASE_URL = "https://labmate-backend-u7dd.onrender.com/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
};

export const createExperiment = async (data) => {
  const res = await fetch(`${BASE_URL}/experiments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyExperiments = async () => {
  const res = await fetch(`${BASE_URL}/experiments`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getExperiment = async (id) => {
  const res = await fetch(`${BASE_URL}/experiments/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const generateReport = async (id) => {
  const res = await fetch(`${BASE_URL}/experiments/${id}/generate-report`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};

export const updateExperiment = async (id, data) => {
  const res = await fetch(`${BASE_URL}/experiments/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteExperiment = async (id) => {
  const res = await fetch(`${BASE_URL}/experiments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

export const getVivaQuestions = async (experimentId) => {
  const res = await fetch(`${BASE_URL}/viva/${experimentId}/questions`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const evaluateAnswer = async (experimentId, payload) => {
  const res = await fetch(`${BASE_URL}/viva/${experimentId}/evaluate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
};