import axios from 'axios';
import { API_BASE_URL } from './config';

export interface Question {
  id: number;
  topicId: number;
  question: string;
  answer: string;
  createdAt: string;
}

export interface GenerateQuestionRequest {
  topicId: number;
  topicContent: string;
  exampleContent?: string;
}

export const questionsApi = {
  getByTopicId: async (topicId: number): Promise<Question[]> => {
    const response = await axios.get(`${API_BASE_URL}/questions?topicId=${topicId}`);
    return response.data;
  },

  generate: async (data: GenerateQuestionRequest): Promise<Question> => {
    const response = await axios.post(`${API_BASE_URL}/questions/generate`, data);
    return response.data;
  },
};

