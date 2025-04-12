
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    setConnectionError(null);
    
    try {
      console.log("Tentando login com:", email);
      const result = await login(email, password);

      // Verificar se o login foi bem-sucedido antes de redirecionar
      if (result.session) {
        // Adicionar um pequeno atraso para garantir que a sessão seja processada corretamente
        // antes de redirecionar
        setTimeout(() => {
          navigate("/dashboard", {
            replace: true
          });
          setIsSubmitting(false);
        }, 500); // Aumentar para 500ms para dar mais tempo de processamento
      } else {
        setError("Não foi possível obter uma sessão válida");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);
      
      if (err.message?.includes('Failed to fetch') || err.code === 'NETWORK_ERROR') {
        setConnectionError("Não foi possível conectar ao servidor Supabase. Verifique se o projeto Supabase está ativo e se a conexão com a internet está funcionando.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      }
      
      setIsSubmitting(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    error,
    showPassword,
    connectionError,
    handleLogin,
    togglePasswordVisibility
  };
};
