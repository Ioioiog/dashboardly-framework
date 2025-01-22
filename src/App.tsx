import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { useAuthState } from "@/hooks/useAuthState";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  const { isLoading, isAuthenticated } = useAuthState();

  if (isLoading) {
    return <div>Loading...</div>; // Add a proper loading component later
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes isAuthenticated={isAuthenticated} />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;