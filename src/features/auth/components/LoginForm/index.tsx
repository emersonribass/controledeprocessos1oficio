
import React from "react";
import { useLoginForm } from "./useLoginForm";
import { LoginFormPresentation } from "./LoginFormPresentation";

const AuthLoginForm = () => {
  const {
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
  } = useLoginForm();
  
  return (
    <LoginFormPresentation
      email={email}
      password={password}
      isSubmitting={isSubmitting}
      error={error}
      showPassword={showPassword}
      connectionError={connectionError}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleLogin}
      onTogglePasswordVisibility={togglePasswordVisibility}
    />
  );
};

export default AuthLoginForm;
