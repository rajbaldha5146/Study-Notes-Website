import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Notes API
export const getNotes = async (params = {}) => {
  const response = await api.get("/notes", { params });
  return response.data;
};

export const getNote = async (id) => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await api.post("/notes", noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await api.put(`/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

export const updateHighlights = async (id, highlights) => {
  const response = await api.patch(`/notes/${id}/highlights`, { highlights });
  return response.data;
};

export const updateDrawings = async (id, drawings) => {
  const response = await api.patch(`/notes/${id}/drawings`, { drawings });
  return response.data;
};

// Folders API
export const getFolders = async () => {
  const response = await api.get('/folders');
  return response.data;
};

export const getFolderTree = async () => {
  const response = await api.get('/folders/tree');
  return response.data;
};

export const getFolder = async (id) => {
  const response = await api.get(`/folders/${id}`);
  return response.data;
};

export const createFolder = async (folderData) => {
  const response = await api.post('/folders', folderData);
  return response.data;
};

export const updateFolder = async (id, folderData) => {
  const response = await api.put(`/folders/${id}`, folderData);
  return response.data;
};

export const deleteFolder = async (id) => {
  const response = await api.delete(`/folders/${id}`);
  return response.data;
};

export default api;
