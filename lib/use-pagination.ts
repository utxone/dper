import { useEffect, useState, useMemo } from "react";
import useSwr from "swr";
import queryString from "query-string";

export async function getData<T>(
  path: string,
  page: number,
  pageSize: number,
  options?: {
    [key: string]: string;
  }
): Promise<{ data: T[]; total: number }> {
  const url = queryString.stringify({
    page,
    page_size: pageSize,
    ...options,
  });
  const response = await fetch(`${path}?${url}`);
  const result = await response.json();
  return result as { data: T[]; total: number };
}

export function usePagination<T extends { id: string }>(path: string) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState<
    | {
        [key: string]: string;
      }
    | undefined
  >();
  const [records, setRecords] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const hasPre = useMemo(() => page > 1, [page]);
  const hasNext = useMemo(() => records.length === 8, [records.length]);
  const { data, isLoading, error } = useSwr<{ data: T[]; total: number }>(
    {
      path,
      page,
      options,
    },
    (key: any) => getData<T>(key.path, key.page, 8, key.options)
  );

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    setRecords([]);
  }, [options]);

  useEffect(() => {
    if (!data) return;
    setTotal(data.total)
    if (data.data.length > 0) {
      setRecords(data.data);
    } else if (page > 1) {
      setPage(page - 1);
      setHasMore(false);
    }
  }, [data]);


  return {
    page,
    setPage,
    records,
    hasNext,
    hasMore,
    hasPre,
    total,
    isLoading,
    setOptions,
    error,
  };
}
