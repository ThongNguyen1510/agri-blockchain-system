import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AuthResponseDto, UserDto } from "@/types/api";

interface AuthState {
  user: UserDto | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: string,
    walletAddress: string,
    displayName: string,
    phone?: string,
    address?: string,
  ) => Promise<void>;
  logout: () => void;
  setAuth: (payload: AuthResponseDto) => void;
}

const STORAGE_KEY = "agrochain.auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [state, setState] = useState<AuthState>({ user: null, token: null });
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        console.log("Loaded auth state from localStorage:", parsed);
        if (parsed?.token) {
          setState({ token: parsed.token, user: parsed.user ?? null });
        }
      }
    } catch (error) {
      console.error("Error loading auth state from localStorage:", error);
      // ignore parse errors and clear corrupted value
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistState = useCallback((next: AuthState) => {
    setState(next);
    if (next.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    queryClient.clear();
  }, [queryClient]);

  const setAuth = useCallback((payload: AuthResponseDto) => {
    persistState({ token: payload.accessToken, user: payload.user });
  }, [persistState]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiClient.login(email, password);
      persistState({ token: response.accessToken, user: response.user });
    },
    [persistState],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      role: string,
      walletAddress: string,
      displayName: string,
      phone?: string,
      address?: string,
    ) => {
      const response = await apiClient.register(email, password, role, walletAddress, displayName, phone, address);
      persistState({ token: response.accessToken, user: response.user });
    },
    [persistState],
  );

  const logout = useCallback(() => {
    persistState({ token: null, user: null });
  }, [persistState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isLoading,
      login,
      register,
      logout,
      setAuth,
    }),
    [state, isLoading, login, register, logout, setAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
