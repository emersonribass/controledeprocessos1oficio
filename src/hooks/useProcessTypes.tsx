
import { useState } from "react";
import { mockProcessTypes } from "@/lib/mockData";

export const useProcessTypes = () => {
  const [processTypes] = useState(mockProcessTypes);

  const getProcessTypeName = (id: string) => {
    const processType = processTypes.find((pt) => pt.id === id);
    return processType ? processType.name : "Desconhecido";
  };

  return {
    processTypes,
    getProcessTypeName,
  };
};
