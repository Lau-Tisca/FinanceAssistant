export type UserRole = 'USER' | 'VIP' | 'ADMIN';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface AccountResponseDTO {
  id: number;
  userName: string;
  email: string;
  createdAt: string;
  role?: UserRole;
  token?: string;
}

export interface LoginRequestDTO {
  loginIdentifier: string;
  password: string;
}

export interface AccountCreateDTO {
  userName: string;
  email: string;
  password: string;
}

export interface TransactionViewDTO {
  id: number;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  categoryName: string;
}

export interface AccountSummaryDTO {
  accountId: number;
  userName: string;
  email: string;
  recentTransactions: TransactionViewDTO[];
  totalBalanceCalculated: number;
}

export interface CreateTransactionDTO {
  userId: number;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  categoryId: number;
}

export interface UpdateTransactionDTO {
  amount: number;
  description: string;
  date: string;
  categoryId: number;
}

export interface SmartTransactionDTO {
  description: string;
  amount: number;
}

export interface CreateTransactionWithAIRequestDTO {
  email: string;
  amount: number;
  date?: string;
  description: string;
  categoryId: number;
}

export interface CreateTransactionWithAIResponseDTO {
  transaction: TransactionViewDTO;
  aiSuggestion: string;
  detectedType: TransactionType;
}

export interface MessageCreateDTO {
  role: string;
  content: string;
}

export interface MessageDTO {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

export interface ChatCreateDTO {
  title: string;
  messages?: MessageCreateDTO[];
}

export interface ChatDTO {
  id: number;
  title: string;
  messages?: MessageDTO[];
  createdAt: string;
}

export interface AnalyzeTransactionsRequestDTO {
  email: string;
  customPrompt?: string;
}

export interface AnalyzeTransactionsResponseDTO {
  email: string;
  userId: number;
  transactionCount: number;
  transactions: TransactionViewDTO[];
  aiAnalysis: string;
}

export interface CategoryOption {
  id: number;
  name: string;
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 1, name: 'Salariu' },
  { id: 2, name: 'Cumparaturi' },
  { id: 3, name: 'Facturi' },
  { id: 4, name: 'Mancare' },
  { id: 5, name: 'Food' },
  { id: 6, name: 'Transport' },
  { id: 7, name: 'Entertainment' },
  { id: 8, name: 'Health' },
  { id: 9, name: 'Utilities' },
  { id: 10, name: 'Income' },
];
