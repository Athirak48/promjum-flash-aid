import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import FlashcardsPage from "./pages/FlashcardsPage";
import { FolderDetail } from "./pages/FolderDetail";

import FeedbackPage from "./pages/FeedbackPage";
import Profile from "./pages/Profile";
import NotFoundPage from "./pages/NotFoundPage";
import Navbar from "./components/Navbar";
import FlashcardsReview from "./pages/FlashcardsReview";
import DecksPage from "./pages/DecksPage";
import SubDecksPage from "./pages/SubDecksPage";
import AIRealtimePracticePage from "./pages/AIRealtimePracticePage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDecks from "./pages/admin/AdminDecks";
import AdminDeckDetail from "./pages/admin/AdminDeckDetail";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminFeedback from "./pages/admin/AdminFeedback";

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
                <Routes>
              <Route path="/" element={<><Navbar /><LandingPage /></>} />
              <Route path="/auth" element={<><Navbar /><AuthPage /></>} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><Dashboard /></>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/flashcards" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><FlashcardsPage /></>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/flashcards/review" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><FlashcardsReview /></>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/flashcards/:folderId" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><FolderDetail /></>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><FeedbackPage /></>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><Profile /></>
                  </ProtectedRoute>
                } 
              />
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="decks" element={<AdminDecks />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="feedback" element={<AdminFeedback />} />
              </Route>
              <Route 
                path="/admin/decks/:deckId" 
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDeckDetail />} />
              </Route>
              
              <Route
                path="/decks" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><DecksPage /></>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/decks/:deckId/subdecks" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><SubDecksPage /></>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/practice" 
                element={
                  <ProtectedRoute>
                    <><Navbar /><AIRealtimePracticePage /></>
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<><Navbar /><NotFoundPage /></>} />
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
