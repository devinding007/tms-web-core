import { PageResult, Pagination } from '@/types/models/Pagination';

// リポジトリ共通インターフェース
export interface Repo<T> {
  findById(id: string): T | undefined;
  save(obj: T): void;
  remove(id: string): void;
  list(p: Pagination): PageResult<T>;
}
