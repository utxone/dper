import { Dispatch, SetStateAction } from "react";
import ArrowIcon from "./arrow-icon";

interface LoadMoreProps {
  hasNext: boolean;
  isLoading: boolean;
  hasPre: boolean;
  empty: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}
export function LoadMore({
  hasNext,
  hasPre,
  isLoading,
  setPage,
  empty,
}: LoadMoreProps) {
  if (isLoading)
    return (
      <div className="flex flex-row justify-center space-x-6">
        <span className="spinner-loader"></span>
      </div>
    );
  return (
    <div className="flex flex-row justify-center space-x-6">
      {hasPre && (
        <div
          className="cursor-pointer hover:text-orange-500"
          onClick={() => {
            setPage((page) => page - 1);
          }}
        >
          {"<-"}
        </div>
      )}
      {hasNext && (
        <div
          className="cursor-pointer hover:text-orange-500"
          onClick={() => {
            setPage((page) => page + 1);
          }}
        >
          {"->"}
        </div>
      )}
    </div>
  );
}
