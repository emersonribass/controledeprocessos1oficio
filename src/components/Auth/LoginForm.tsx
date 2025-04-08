
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginForm = () => {
  // Login state
  const [email, setEmail] = useState("emerson.ribas@live.com");
  const [password, setPassword] = useState("123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    login
  } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      // Erro já é tratado pelo hook useAuth, mas podemos exibir mensagem específica aqui
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return <Card className="w-[380px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Nottar</CardTitle>
        <CardDescription className="text-center">
          Acesse o sistema de controle de processos
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              
            </div>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Entrando...
              </span> : "Entrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>;
};

export default LoginForm;
