
# Documentação de Tratamento de Erros

## ErrorBoundary

O componente `ErrorBoundary` é usado para capturar erros que ocorrem durante a renderização, em métodos do ciclo de vida e em construtores de componentes filhos.

### Uso Básico

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";

// Envolvendo um componente ou uma parte da aplicação
<ErrorBoundary>
  <MeuComponente />
</ErrorBoundary>

// Com callback de erro personalizado
<ErrorBoundary
  onError={(error, info) => {
    // Lógica personalizada, como enviar para serviço de monitoramento
    reportError(error, info);
  }}
>
  <MeuComponente />
</ErrorBoundary>

// Com fallback personalizado
<ErrorBoundary
  fallback={<MeuComponenteDeFallbackPersonalizado />}
>
  <MeuComponente />
</ErrorBoundary>
```

### Props

- `children`: Componentes React que serão monitorados para erros
- `fallback`: (Opcional) Componente React para exibir em caso de erro
- `onReset`: (Opcional) Função chamada quando o usuário tenta resetar o estado de erro
- `onError`: (Opcional) Função chamada quando um erro é capturado

## Hook useErrorHandler

O hook `useErrorHandler` fornece uma maneira consistente de lidar com erros em componentes e hooks.

### Uso Básico

```tsx
import { useErrorHandler } from "@/hooks/useErrorHandler";

const MeuComponente = () => {
  const { handleError, error, isError, clearError } = useErrorHandler();

  const fazerAlgo = async () => {
    try {
      // Lógica que pode lançar erros
      await minhaFuncaoAsync();
    } catch (err) {
      // Tratar o erro de forma consistente
      handleError(err);
    }
  };

  // Exibir o erro no componente
  if (isError) {
    return <div>Erro: {error.message}</div>;
  }

  return (
    <button onClick={fazerAlgo}>Fazer Algo</button>
  );
};
```

### Configurações

O método `handleError` aceita opções para personalizar o comportamento:

```tsx
handleError(erro, {
  showToast: true,       // Exibir notificação Toast
  toastDuration: 5000,   // Duração da notificação em ms
  logError: true         // Registrar no console
});
```

## Boas Práticas

1. **Use ErrorBoundary em componentes de rota**: Coloque um ErrorBoundary em cada componente de página.
2. **Use try/catch em operações assíncronas**: Sempre envolva chamadas de API com try/catch.
3. **Forneça feedback ao usuário**: Use toasts ou componentes de alerta para informar sobre erros.
4. **Registre erros**: Certifique-se de que erros são registrados para depuração posterior.
5. **Implemente tratamento de erros de rede**: Verifique especificamente erros de conexão.

## Implementando em Chamadas API

```tsx
const fetchData = async () => {
  try {
    setIsLoading(true);
    const response = await api.get('/dados');
    return response.data;
  } catch (error) {
    handleError(error, {
      showToast: true,
      toastDuration: 4000
    });
    return null;
  } finally {
    setIsLoading(false);
  }
};
```
