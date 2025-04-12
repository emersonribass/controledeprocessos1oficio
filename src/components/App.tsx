
import { BrowserRouter as Router } from "react-router-dom";
import { Routes } from "@/routes/Routes";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "./ErrorBoundary/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes />
        <Toaster position="top-right" richColors closeButton />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
