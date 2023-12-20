import { useEffect, useState } from "react";
import useSwr from "swr";
import queryString from "query-string";

export async function getData<T>(
  path: string,
  page: number,
  pageSize: number,
  options?: {
    [key: string]: string;
  }
): Promise<T[]> {
  const url = queryString.stringify({
    page,
    page_size: pageSize,
    ...options,
  });
  const response = await fetch(`${path}?${url}`);
  const result = await response.json();
  return result as T[];
}

export function usePagination<T extends { id: string }>(path: string) {
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<
    | {
        [key: string]: string;
      }
    | undefined
  >();
  const [records, setRecords] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, error } = useSwr<T[]>(
    {
      path,
      page,
      options,
    },
    (key: any) => getData<T>(key.path, key.page, 20, key.options)
  );

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    setRecords([]);
  }, [options]);

  useEffect(() => {
    if (!data) return;
    if (data.length > 0) {
      setRecords((records) => {
        data.forEach((item) => {
          if (!records.find((record) => item.id === record.id)) {
            records = [...records, item];
          }
        });
        return records;
      });
    } else {
      setHasMore(false);
    }
  }, [data]);

  return {
    setPage,
    records,
    hasMore,
    isLoading,
    setOptions,
    error,
  };
}
