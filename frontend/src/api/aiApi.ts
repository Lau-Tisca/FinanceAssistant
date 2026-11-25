import { apiClient } from './client';
import type {
  AnalyzeTransactionsRequestDTO,
  AnalyzeTransactionsResponseDTO,
  ChatCreateDTO,
  ChatDTO,
  CreateTransactionWithAIRequestDTO,
  CreateTransactionWithAIResponseDTO,
  MessageCreateDTO,
  MessageDTO,
} from '../types';

const AI_BASE = '/microservice-ai/api/ai';
const CHATS_BASE = '/microservice-ai/api/chats';

export const aiApi = {
  async listChats(): Promise<ChatDTO[]> {
    const { data } = await apiClient.get<ChatDTO[]>(CHATS_BASE);
    return data;
  },

  async createChat(payload: ChatCreateDTO): Promise<ChatDTO> {
    const { data } = await apiClient.post<ChatDTO>(CHATS_BASE, payload);
    return data;
  },

  async deleteChat(id: number): Promise<void> {
    await apiClient.delete(`${CHATS_BASE}/${id}`);
  },

  async getMessages(chatId: number): Promise<MessageDTO[]> {
    const { data } = await apiClient.get<MessageDTO[]>(`${CHATS_BASE}/${chatId}/messages`);
    return data;
  },

  async addMessage(chatId: number, payload: MessageCreateDTO): Promise<MessageDTO> {
    const { data } = await apiClient.post<MessageDTO>(`${CHATS_BASE}/${chatId}/messages`, payload);
    return data;
  },

  async analyzeTransactions(
    payload: AnalyzeTransactionsRequestDTO
  ): Promise<AnalyzeTransactionsResponseDTO> {
    const { data } = await apiClient.post<AnalyzeTransactionsResponseDTO>(
      `${AI_BASE}/analyze-transactions`,
      payload
    );
    return data;
  },

  async createSmartTransactionWithAI(
    payload: CreateTransactionWithAIRequestDTO
  ): Promise<CreateTransactionWithAIResponseDTO> {
    const { data } = await apiClient.post<CreateTransactionWithAIResponseDTO>(
      `${AI_BASE}/create-smart-transaction`,
      payload
    );
    return data;
  },
};
