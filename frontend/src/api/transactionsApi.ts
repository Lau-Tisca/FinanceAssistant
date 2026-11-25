import { apiClient } from './client';
import type {
  CreateTransactionDTO,
  SmartTransactionDTO,
  TransactionType,
  TransactionViewDTO,
  UpdateTransactionDTO,
} from '../types';

const BASE = '/microservice-transactions/api/transactions';

export interface TransactionQueryParams {
  type?: TransactionType;
  sortBy?: 'date' | 'amount';
  order?: 'asc' | 'desc';
}

export const transactionsApi = {
  async getUserTransactions(
    userId: number,
    params?: TransactionQueryParams
  ): Promise<TransactionViewDTO[]> {
    const { data } = await apiClient.get<TransactionViewDTO[]>(`${BASE}/user/${userId}`, {
      params,
    });
    return data;
  },

  async filterByType(type: TransactionType): Promise<TransactionViewDTO[]> {
    const { data } = await apiClient.get<TransactionViewDTO[]>(`${BASE}/filter`, {
      params: { type },
    });
    return data;
  },

  async sortTransactions(sortBy: string, order: 'asc' | 'desc' = 'desc'): Promise<TransactionViewDTO[]> {
    const { data } = await apiClient.get<TransactionViewDTO[]>(`${BASE}/sort`, {
      params: { sortBy, order },
    });
    return data;
  },

  async createTransaction(payload: CreateTransactionDTO): Promise<TransactionViewDTO> {
    const { data } = await apiClient.post<TransactionViewDTO>(BASE, payload);
    return data;
  },

  async updateTransaction(id: number, payload: UpdateTransactionDTO): Promise<TransactionViewDTO> {
    const { data } = await apiClient.put<TransactionViewDTO>(`${BASE}/${id}`, payload);
    return data;
  },

  async deleteTransaction(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
  },

  async createSmartTransaction(payload: SmartTransactionDTO): Promise<TransactionViewDTO> {
    const { data } = await apiClient.post<TransactionViewDTO>(`${BASE}/smart`, payload);
    return data;
  },

  async getGlobalSummary(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${BASE}/admin/global-summary`);
    return data;
  },
};
