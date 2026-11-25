import { apiClient } from './client';
import type {
  AccountCreateDTO,
  AccountResponseDTO,
  AccountSummaryDTO,
  LoginRequestDTO,
} from '../types';

const BASE = '/microservice-account/api/v1/accounts';

export const authApi = {
  async login(payload: LoginRequestDTO): Promise<AccountResponseDTO> {
    const { data } = await apiClient.post<AccountResponseDTO>(`${BASE}/login`, payload);
    return data;
  },

  async register(payload: AccountCreateDTO): Promise<AccountResponseDTO> {
    const { data } = await apiClient.post<AccountResponseDTO>(BASE, payload);
    return data;
  },

  async getAccountSummary(id: number): Promise<AccountSummaryDTO> {
    const { data } = await apiClient.get<AccountSummaryDTO>(`${BASE}/${id}/summary`);
    return data;
  },

  async getAllAccounts(): Promise<AccountResponseDTO[]> {
    const { data } = await apiClient.get<AccountResponseDTO[]>(BASE);
    return data;
  },

  async promoteToVip(id: number): Promise<AccountResponseDTO> {
    const { data } = await apiClient.put<AccountResponseDTO>(`${BASE}/${id}/promote-vip`);
    return data;
  },
};
