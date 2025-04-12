
import { Department, Process, ProcessType } from "@/types";

export const useTableUtils = () => {
  const sortTableData = <T>(data: T[], field: keyof T, direction: "asc" | "desc"): T[] => {
    return [...data].sort((a, b) => {
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        if (direction === "asc") {
          return (a[field] as unknown as string).localeCompare(b[field] as unknown as string);
        } else {
          return (b[field] as unknown as string).localeCompare(a[field] as unknown as string);
        }
      } else if (typeof a[field] === "number" && typeof b[field] === "number") {
        if (direction === "asc") {
          return (a[field] as unknown as number) - (b[field] as unknown as number);
        } else {
          return (b[field] as unknown as number) - (a[field] as unknown as number);
        }
      }
      return 0;
    });
  };

  const filterTableData = <T>(
    data: T[],
    filters: Record<string, any>,
    filterFunctions: Record<string, (item: T, value: any) => boolean>
  ): T[] => {
    return data.filter(item => {
      for (const key in filters) {
        if (filters[key] && filterFunctions[key]) {
          if (!filterFunctions[key](item, filters[key])) {
            return false;
          }
        }
      }
      return true;
    });
  };

  return {
    sortTableData,
    filterTableData
  };
};
