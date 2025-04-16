
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastPrimitive,
  toast as toastPrimitive,
} from "@/components/ui/toast";

const useToast = useToastPrimitive;
const toast = toastPrimitive;

export { useToast, toast };
export type { Toast, ToastActionElement, ToastProps };
