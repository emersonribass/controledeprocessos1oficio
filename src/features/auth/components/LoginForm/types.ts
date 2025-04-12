
export interface LoginState {
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
  showPassword: boolean;
  connectionError: string | null;
}
