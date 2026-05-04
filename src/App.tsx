import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { HomePage } from "@/pages/HomePage";
import { LegalPage } from "@/pages/LegalPage";
import { AuthProvider } from "@/contexts/AuthContext";

function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-serif font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">Page introuvable</p>
      <a href="/" className="text-gold-500 hover:underline text-sm">Retour à l'accueil</a>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" theme="dark" toastOptions={{ style: { background: "hsl(220 18% 9%)", border: "1px solid hsl(220 15% 16%)", color: "hsl(45 30% 92%)" } }} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
