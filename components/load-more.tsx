import { Dispatch, SetStateAction } from "react";

interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  empty: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}
export function LoadMore({
  hasMore,
  isLoading,
  setPage,
  empty,
}: LoadMoreProps) {
  if (!hasMore)
    return (
      <div className="w-full text-center text-md opacity-70 dark:text-white">
        No more data
      </div>
    );
  if (isLoading)
    return (
      <div className="dot-loader w-full text-center text-md opacity-70 dark:text-white">
      </div>
    );
  if (empty)
    return (
      <div className="dot-loader w-full text-center text-md opacity-70 dark:text-white">
        No data
      </div>
    );
  return (
    <div
      className="w-full cursor-pointer text-center text-lg opacity-70 dark:text-white"
      onClick={() => {
        if (hasMore) setPage((page) => page + 1);
      }}
    >
      Load more
    </div>
  );
}
