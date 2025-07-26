
import { api } from "./api";

export interface Tag {
  _id: string;
  name: string;
  displayName: string;
  postCount: number;
  trendingScore: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrendingTagsResponse {
  tags: Tag[];
  timeFilter: string;
  count: number;
}

export interface TagSearchResponse {
  tags: Tag[];
}

export interface TagPostsResponse {
  posts: any[];
  hasMore: boolean;
  tag: string;
}

// Get trending tags
export const getTrendingTags = async (params: {
  limit?: number;
  timeFilter?: 'today' | 'week' | 'month' | 'all';
} = {}): Promise<TrendingTagsResponse> => {
  const { limit = 10, timeFilter = 'all' } = params;
  const queryParams = new URLSearchParams();
  
  if (limit) queryParams.append('limit', limit.toString());
  if (timeFilter) queryParams.append('timeFilter', timeFilter);
  
  const response = await api.get(`/api/tags/trending?${queryParams.toString()}`);
  return response.data;
};

// Search tags
export const searchTags = async (query: string): Promise<TagSearchResponse> => {
  const response = await api.get(`/api/tags/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// Get posts by tag
export const getPostsByTag = async (params: {
  tagName: string;
  limit?: number;
  after?: string | null;
}): Promise<TagPostsResponse> => {
  const { tagName, limit = 20, after = null } = params;
  const queryParams = new URLSearchParams();
  
  if (limit) queryParams.append('limit', limit.toString());
  if (after) queryParams.append('after', after);
  
  const response = await api.get(`/api/tags/${encodeURIComponent(tagName)}/posts?${queryParams.toString()}`);
  return response.data;
};
