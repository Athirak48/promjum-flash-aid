import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import FlashcardsPage from "./pages/FlashcardsPage";
import { FolderDetail } from "./pages/FolderDetail";
import MarketcardPage from "./pages/MarketcardPage";
import FeedbackPage from "./pages/FeedbackPage";
import Profile from "./pages/Profile";
import NotFoundPage from "./pages/NotFoundPage";
import Navbar from "./components/Navbar";
import FlashcardsReview from "./pages/FlashcardsReview";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <LanguageProvider>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Navbar />
                <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/flashcards" 
                element={
                  <ProtectedRoute>
                    <FlashcardsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketcard" 
                element={
                  <ProtectedRoute>
                    <MarketcardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback" 
                element={
                  <ProtectedRoute>
                    <FeedbackPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/flashcards/:folderId" 
                element={
                  <ProtectedRoute>
                    <FolderDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/flashcards/review" 
                element={
                  <ProtectedRoute>
                    <FlashcardsReview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/decks" 
                element={
                  <ProtectedRoute>
                    {React.createElement(React.lazy(() => import('./pages/DecksPage')))}
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/decks/:deckId" 
                element={
                  <ProtectedRoute>
                    {React.createElement(React.lazy(() => import('./pages/SubDecksPage')))}
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </LanguageProvider>
  </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
