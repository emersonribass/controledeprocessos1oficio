
import { ReactNode } from "react";
import { useNotifications } from "./useNotifications";

type NotificationsContextProps = {
  children: ReactNode;
};

export const NotificationsProvider = ({ children }: NotificationsContextProps) => {
  // useNotifications fornece o contexto necessário para os componentes filhos
  useNotifications();
  
  return <>{children}</>;
};
