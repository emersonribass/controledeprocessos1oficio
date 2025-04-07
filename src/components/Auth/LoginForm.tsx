
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, EyeIcon, EyeOffIcon, UserIcon, KeyIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Definição de esquema de validação
const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Configuração do formulário com validação
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "emerson@nottar.com.br",
      password: "123456"
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setStatusMessage("Verificando credenciais...");

    try {
      console.log("Tentando login com:", values.email);
      await login(values.email, values.password);
      setStatusMessage("Login bem-sucedido! Redirecionando...");
      navigate("/");
    } catch (error) {
      console.error("Erro no login:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      }
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Nottar</CardTitle>
        <CardDescription className="text-center">
          Acesse o sistema de controle de processos
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {statusMessage && !error && (
              <Alert className="mb-4">
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        placeholder="seu@email.com"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a
                      href="#"
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Funcionalidade não implementada");
                      }}
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LoginForm;
