
import LoginForm from "@/components/Auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Nottar</h1>
        <p className="text-muted-foreground">Sistema de Gestão de Processos</p>
      </div>
      <LoginForm />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <span className="mr-1">Credenciais de demonstração:</span>
        <br />
        <code className="bg-muted rounded p-1">emerson.ribas@live.com / 123456</code>
      </p>
    </div>
  );
};

export default LoginPage;
