
import { Process } from "@/types";

export interface ProcessResponsiblesHookResult {
  processResponsibles: Record<string, string | null>;
  setProcessResponsibles?: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  hasProcessResponsible: (processId: string) => boolean;
  isUserProcessResponsible: (processId: string) => boolean;
  isMainResponsible: boolean;
  isSectorResponsible: boolean;
  hasResponsibleUser: boolean;
  mainResponsibleUserName: string | null;
  sectorResponsibleUserName: string | null;
  refreshResponsibility: () => Promise<void>;
  acceptProcess: () => Promise<boolean>;
}

export interface UseProcessResponsiblesProps {
  processes?: Process[];
  processId?: string;
}
