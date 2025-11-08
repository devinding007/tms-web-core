export interface Pagination {
  size: number;
  page: number;
}

export type PageResult<T> = {
  items: T[];
  total: number; // 全件数
};
