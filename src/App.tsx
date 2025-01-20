import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { AppContent } from "./components/app/AppContent";
import { QueryProvider } from "./components/app/QueryProvider";
import "./i18n/config";

const App = () => {
  return (
    <StrictMode>
      <QueryProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryProvider>
    </StrictMode>
  );
};

export default App;