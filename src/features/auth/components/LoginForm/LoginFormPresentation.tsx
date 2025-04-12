
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interface para os props do componente de apresentação
export interface LoginFormPresentationProps {
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
  showPassword: boolean;
  connectionError: string | null;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePasswordVisibility: () => void;
}

// Componente de apresentação pura
export const LoginFormPresentation = ({
  email,
  password,
  isSubmitting,
  error,
  showPassword,
  connectionError,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onTogglePasswordVisibility
}: LoginFormPresentationProps) => {
  return (
    <Card className="w-[380px] shadow-lg">
      <CardContent className="pt-6 px-6 py-[14px]">
        <div className="flex flex-col items-center mb-6">
          <img src="/Logo Nottar vertical.png" alt="Logo Nottar" className="h-32 w-auto" />
          <h1 className="text-xl font-bold text-center mt-4">Controle de Processos</h1>
          <CardDescription className="text-center mt-1">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {connectionError}
              <p className="text-xs mt-1">
                Verifique se o projeto Supabase não está pausado ou se houve
                alguma alteração nas credenciais de acesso.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={onEmailChange} 
                className="pl-10" 
                required 
                disabled={isSubmitting} 
                aria-label="Email para login"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={onPasswordChange} 
                className="pl-10" 
                required 
                disabled={isSubmitting} 
                aria-label="Senha para login"
              />
              <button 
                type="button" 
                onClick={onTogglePasswordVisibility} 
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600" 
            type="submit" 
            disabled={isSubmitting}
            aria-label="Botão para entrar no sistema"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
