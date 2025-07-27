
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getGlobalFeed = async (filters: {
  limit?: number;
  after?: string | null;
}) => {
  const response = await axios.get(`${API_BASE_URL}/api/posts/feed`, {
    params: filters,
  });
  return response.data;
};

export const getCollegeFeed = async (filters: {
  limit?: number;
  after?: string | null;
  college: string;
}) => {
  const response = await axios.get(`${API_BASE_URL}/api/posts/feed/college`, {
    params: filters,
  });
  return response.data;
};

export const getAreaFeed = async (filters: {
  limit?: number;
  after?: string | null;
  area: string;
}) => {
  const response = await axios.get(`${API_BASE_URL}/api/posts/feed/area`, {
    params: filters,
  });
  return response.data;
};

export const updateUserProfile = async (profileData: {
  college?: string;
  area?: string;
}) => {
  const response = await axios.put(`${API_BASE_URL}/api/users/profile`, profileData);
  return response.data;
};

export const createPost = async (postData: {
  content: string;
  images?: string[];
  videos?: Array<{ url: string; thumbnail?: string; duration?: number }>;
  feedType?: "global" | "college" | "area";
  college?: string;
  area?: string;
  tags?: string[];
}) => {
  const response = await axios.post(`${API_BASE_URL}/api/posts`, postData);
  return response.data;
};
