import axios from 'axios';
import { API_BASE_URL } from './config';

export interface Topic {
  id: number;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicDto {
  title: string;
  content: string;
  order?: number;
}

export interface UpdateTopicDto {
  title?: string;
  content?: string;
  order?: number;
}

export const topicsApi = {
  getAll: async (): Promise<Topic[]> => {
    const response = await axios.get(`${API_BASE_URL}/topics`);
    return response.data;
  },

  getById: async (id: number): Promise<Topic> => {
    const response = await axios.get(`${API_BASE_URL}/topics/${id}`);
    return response.data;
  },

  create: async (data: CreateTopicDto): Promise<Topic> => {
    const response = await axios.post(`${API_BASE_URL}/topics`, data);
    return response.data;
  },

  update: async (id: number, data: UpdateTopicDto): Promise<Topic> => {
    const response = await axios.patch(`${API_BASE_URL}/topics/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/topics/${id}`);
  },
};

