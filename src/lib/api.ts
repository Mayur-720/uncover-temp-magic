
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8900';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User authentication functions
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (username: string, fullName: string, email: string, password: string, referralCode?: string) => {
  const response = await api.post('/api/auth/register', { username, fullName, email, password, referralCode });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await api.post('/api/auth/reset-password', { token, newPassword });
  return response.data;
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (profileData: any) => {
  const response = await api.put('/api/users/profile', profileData);
  return response.data;
};

export const deleteUserAccount = async () => {
  const response = await api.delete('/api/users/account');
  return response.data;
};

// Post functions
export const getPostById = async (postId: string) => {
  const response = await api.get(`/api/posts/${postId}`);
  return response.data;
};

export const getUserPosts = async (userId: string) => {
  const response = await api.get(`/api/posts/user/${userId}`);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete(`/api/posts/${postId}`);
  return response.data;
};

export const updatePost = async (postId: string, content: string, images?: string[], videos?: any[]) => {
  const response = await api.put(`/api/posts/${postId}`, { content, images, videos });
  return response.data;
};

export const likePost = async (postId: string) => {
  const response = await api.post(`/api/posts/${postId}/like`);
  return response.data;
};

export const sharePost = async (postId: string) => {
  const response = await api.post(`/api/posts/${postId}/share`);
  return response.data;
};

// Comment functions
export const getComments = async (postId: string) => {
  const response = await api.get(`/api/posts/${postId}/comments`);
  return response.data;
};

export const addComment = async (postId: string, content: string, anonymousAlias?: string) => {
  const response = await api.post(`/api/posts/${postId}/comments`, { content, anonymousAlias });
  return response.data;
};

export const editComment = async (postId: string, commentId: string, content: string) => {
  const response = await api.put(`/api/posts/${postId}/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (postId: string, commentId: string) => {
  const response = await api.delete(`/api/posts/${postId}/comments/${commentId}`);
  return response.data;
};

export const replyToComment = async (postId: string, commentId: string, content: string, anonymousAlias: string) => {
  const response = await api.post(`/api/posts/${postId}/comments/${commentId}/replies`, { content, anonymousAlias });
  return response.data;
};

export const deleteReply = async (postId: string, commentId: string, replyId: string) => {
  const response = await api.delete(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`);
  return response.data;
};

export const updateReply = async (postId: string, commentId: string, replyId: string, content: string) => {
  const response = await api.put(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`, { content });
  return response.data;
};

// Ghost circle functions
export const getGhostCirclePosts = async (circleId: string) => {
  const response = await api.get(`/api/ghost-circles/${circleId}/posts`);
  return response.data;
};

export const getMyGhostCircles = async () => {
  const response = await api.get('/api/ghost-circles/my');
  return response.data;
};

export const createGhostCircle = async (circleData: any) => {
  const response = await api.post('/api/ghost-circles', circleData);
  return response.data;
};

export const joinGhostCircle = async (inviteCode: string) => {
  const response = await api.post(`/api/ghost-circles/join`, { inviteCode });
  return response.data;
};

export const inviteToGhostCircle = async (circleId: string, userIds: string[]) => {
  const response = await api.post(`/api/ghost-circles/${circleId}/invite`, { userIds });
  return response.data;
};

// User search
export const searchUsers = async (query: string) => {
  const response = await api.get(`/api/users/search?q=${query}`);
  return response.data;
};

// Recognition functions
export const getRecognitions = async () => {
  const response = await api.get('/api/recognitions');
  return response.data;
};

export const recognizeUser = async (userId: string) => {
  const response = await api.post('/api/recognitions', { userId });
  return response.data;
};

export const revokeRecognition = async (recognitionId: string) => {
  const response = await api.delete(`/api/recognitions/${recognitionId}`);
  return response.data;
};

// Weekly prompt functions
export const getWeeklyPrompt = async () => {
  const response = await api.get('/api/prompts/weekly');
  return response.data;
};

export const setWeeklyPrompt = async (promptData: any) => {
  const response = await api.post('/api/prompts/weekly', promptData);
  return response.data;
};

// Whisper functions
export const getMyWhispers = async () => {
  const response = await api.get('/api/whispers');
  return response.data;
};

export const joinWhisperMatch = async () => {
  const response = await api.post('/api/whisper-match/join');
  return response.data;
};

export const sendWhisperMatchMessage = async (matchId: string, content: string) => {
  const response = await api.post('/api/whisper-match/message', { matchId, content });
  return response.data;
};

export const leaveWhisperMatch = async (matchId: string) => {
  const response = await api.post('/api/whisper-match/leave', { matchId });
  return response.data;
};

export const deleteConversation = async (partnerId: string) => {
  const response = await api.delete(`/api/whispers/conversation/${partnerId}`);
  return response.data;
};

// Tag functions
export const getTrendingTags = async (limit: number = 20, timeFilter: string = 'week') => {
  const response = await api.get(`/api/tags/trending?limit=${limit}&timeFilter=${timeFilter}`);
  return response.data;
};

export const getTagSuggestions = async (query: string) => {
  const response = await api.get(`/api/tags/suggestions?q=${query}`);
  return response.data;
};

export const createTag = async (tagData: { name: string; description?: string }) => {
  const response = await api.post('/api/tags', tagData);
  return response.data;
};

export const followTag = async (tagId: string) => {
  const response = await api.post(`/api/tags/${tagId}/follow`);
  return response.data;
};

export const unfollowTag = async (tagId: string) => {
  const response = await api.delete(`/api/tags/${tagId}/follow`);
  return response.data;
};

export const getFollowedTags = async () => {
  const response = await api.get('/api/tags/followed');
  return response.data;
};

export const getPopularTags = async (limit: number = 10) => {
  const response = await api.get(`/api/tags/popular?limit=${limit}`);
  return response.data;
};

export const getTagById = async (tagId: string) => {
  const response = await api.get(`/api/tags/${tagId}`);
  return response.data;
};

export const updateTag = async (tagId: string, tagData: { name?: string; description?: string }) => {
  const response = await api.put(`/api/tags/${tagId}`, tagData);
  return response.data;
};

export const deleteTag = async (tagId: string) => {
  const response = await api.delete(`/api/tags/${tagId}`);
  return response.data;
};

export const reportTag = async (tagId: string, reason: string) => {
  const response = await api.post(`/api/tags/${tagId}/report`, { reason });
  return response.data;
};
