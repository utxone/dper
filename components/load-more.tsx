import { Dispatch, SetStateAction } from "react";
import ArrowIcon from "./arrow-icon";

interface LoadMoreProps {
  hasNext: boolean;
  isLoading: boolean;
  hasPre: boolean;
  page: number,
  empty: boolean;
  total: number;
  setPage: Dispatch<SetStateAction<number>>;
}
export function LoadMore({
  hasNext,
  hasPre,
  isLoading,
  total,
  page,
  setPage,
  empty,
}: LoadMoreProps) {
  if (isLoading)
    return (
      <div className="flex flex-row justify-center space-x-4">
        <span className="spinner-loader"></span>
      </div>
    );
  return (
    <div className="flex flex-row justify-center space-x-4">
      {hasPre ? (
        <div
          className="cursor-pointer hover:text-orange-600"
          onClick={() => {
            setPage((page) => page - 1);
          }}
        >
          {"<"}
        </div>
      ) : (
        <div className="text-gray-500">{"<"}</div>
      )}  
      <span className="text-white font-mono">[{page}/{total}]</span>
      {hasNext ? (
        <div
          className="cursor-pointer hover:text-orange-600"
          onClick={() => {
            setPage((page) => page + 1);
          }}
        >
          {">"}
        </div>
      ) : (
        <div className="text-gray-500">{">"}</div>
      )}
    </div>
  );
}
