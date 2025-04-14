import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
const LoginForm = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const {
    login,
    setUser,
    setSession
  } = useAuth();
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

      // Verificar se ocorreu algum erro durante o login
      if (result.error) {
        setError(result.error.message);
        setIsSubmitting(false);
        return;
      }

      // Verificar se o login foi bem-sucedido antes de redirecionar
      if (result.session) {
        toast.success("Login efetuado com sucesso", {
          description: "Bem-vindo de volta!",
          duration: 3000,
          important: true
        });
        console.log("Login bem-sucedido, redirecionando para /dashboard");

        // Forçar atualização do estado de autenticação antes de redirecionar
        if (result.user) {
          setUser(result.user);
        }
        setSession(result.session);

        // Redirecionar imediatamente
        navigate("/dashboard", {
          replace: true
        });
      } else {
        setError("Não foi possível obter uma sessão válida");
      }
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);
      if (err.message?.includes('Failed to fetch') || err.code === 'NETWORK_ERROR') {
        setConnectionError("Não foi possível conectar ao servidor Supabase. Verifique se o projeto Supabase está ativo e se a conexão com a internet está funcionando.");
      }

      // Erro já é tratado pelo hook useAuth, mas podemos exibir mensagem específica aqui
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return <Card className="h-auto w-auto shadow-lg">
      <CardContent className="pt-6 px-6 py-[12px]">
        <div className="flex flex-col items-center mb-6">
          <img src="/Logo_Nottar_horizontal.svg" alt="Logo Nottar" className="h-20 w-auto max-auto " />
          <h1 className="text-2xl font-bold text-center">Controle de Processos</h1>
          <CardDescription className="text-center mt-1">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </div>

        {error && <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>}
        
        {connectionError && <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {connectionError}
              <p className="text-xs mt-1">
                Verifique se o projeto Supabase não está pausado ou se houve
                alguma alteração nas credenciais de acesso.
              </p>
            </AlertDescription>
          </Alert>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required disabled={isSubmitting} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required disabled={isSubmitting} />
              <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button className="w-full bg-blue-500 hover:bg-blue-600" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Entrando...
              </span> : "Entrar"}
          </Button>
        </form>
      </CardContent>
        <CardFooter className="flex flex-col justify-center text-sm text-muted-foreground space-y-2">
          <div>Sistema de Controle de Processos</div>
        </CardFooter>
    </Card>;
};
export default LoginForm;