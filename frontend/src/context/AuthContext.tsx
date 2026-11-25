import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/client';
import type {
  AccountCreateDTO,
  AccountResponseDTO,
  LoginRequestDTO,
  UserRole,
} from '../types';

interface AuthContextValue {
  user: AccountResponseDTO | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (payload: LoginRequestDTO) => Promise<AccountResponseDTO>;
  register: (payload: AccountCreateDTO) => Promise<AccountResponseDTO>;
  logout: () => void;
  setDevRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AccountResponseDTO | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AccountResponseDTO;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountResponseDTO | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));

  const persistSession = (account: AccountResponseDTO) => {
    const normalized: AccountResponseDTO = {
      ...account,
      role: account.role ?? 'USER',
    };
    setUser(normalized);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));

    if (account.token) {
      setToken(account.token);
      localStorage.setItem(TOKEN_STORAGE_KEY, account.token);
    }
  };

  const login = async (payload: LoginRequestDTO): Promise<AccountResponseDTO> => {
    const account = await authApi.login(payload);
    persistSession(account);
    return account;
  };

  const register = async (payload: AccountCreateDTO): Promise<AccountResponseDTO> => {
    const account = await authApi.register(payload);
    persistSession(account);
    return account;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const setDevRole = (nextRole: UserRole) => {
    if (!user) return;
    const updated: AccountResponseDTO = { ...user, role: nextRole };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  const role: UserRole = user?.role ?? 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        setDevRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
