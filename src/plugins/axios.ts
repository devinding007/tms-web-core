// src/api/http.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8080';

// アプリ側から差し込めるトークン取得関数（任意）
let tokenProvider: (() => string | null | Promise<string | null>) | null = null;
export function setTokenProvider(fn: typeof tokenProvider) {
  tokenProvider = fn;
}

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 1800_000,
  headers: { 'Content-Type': 'application/json' },
});

// 認可ヘッダ差し込み
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// エラーを見やすく
http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const status = err.response?.status ?? 0;
    const message = err.response?.data?.message ?? err.message ?? 'Network error';
    return Promise.reject(new Error(`HTTP ${status}: ${message}`));
  }
);
