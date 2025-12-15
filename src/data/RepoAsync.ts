import { PageResult, Pagination } from '@/types/models/Pagination';

export interface RepoFilter {}

// リポジトリ共通インターフェース
export interface RepoAsync<T> {
  findById(id: string): Promise<T | undefined>;
  save(item: T): Promise<void>;
  list(p: Pagination): Promise<PageResult<T>>;
  remove(id: string): Promise<void>;
}
