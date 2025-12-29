import React from "react";
import { MaintenanceCheck } from "./components/MaintenanceCheck";
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

import LearningSessionPage from "./pages/LearningSessionPage";
import LearningResultsPage from "./pages/LearningResultsPage";
import MultiplayerPage from "./pages/MultiplayerPage";
import LobbyPage from "./pages/LobbyPage";
import VocabChallengePage from "./pages/VocabChallengePage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDecks from "./pages/admin/AdminDecks";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminDeckDetail from "./pages/admin/AdminDeckDetail";
import AdminSubDeckDetail from "./pages/admin/AdminSubDeckDetail";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminNotification from "./pages/admin/AdminNotification";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminClickAnalyticsPage from "./pages/admin/AdminClickAnalyticsPage";
import AdminOnboarding from "./pages/admin/AdminOnboarding";
import BackgroundDecorations from "./components/BackgroundDecorations";

import FolderBundlePreviewDemo from "./pages/FolderBundlePreviewDemo";
import OnboardingFlow from "./pages/OnboardingFlow";
import OnboardingDebugPage from "./pages/OnboardingDebugPage";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const queryClient = new QueryClient();
import { useAnalytics } from "./hooks/useAnalytics";


const FeedbackMascot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackButtonClick } = useAnalytics();

  // Hide on auth, landing, feedback, games, learning flows, and onboarding
  const hiddenPaths = ['/auth', '/landing', '/', '/feedback', '/onboarding'];
  const hiddenPathPrefixes = [
    '/flashcards/',  // Flashcard games and reviews
    '/learning/',    // Learning flow after "Learning Now"
    '/game/',        // Any game routes
    '/vocab-challenge', // Vocab challenge
    '/lobby/',       // Lobby games
    '/admin',        // All admin pages
  ];

  // Check if current path should hide mascot
  const shouldHide = hiddenPaths.includes(location.pathname) ||
    hiddenPathPrefixes.some(prefix => location.pathname.startsWith(prefix));

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="mr-4 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-2xl rounded-br-none shadow-xl border-2 border-white/30 relative max-w-[180px] text-center backdrop-blur-md"
      >
        <p className="text-sm font-bold font-prompt">มีอะไรจะบอกไหมครับ? 💬</p>
        {/* Arrow */}
        <div className="absolute bottom-0 right-0 translate-x-[-8px] translate-y-[90%] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-pink-600" />
      </motion.div>

      {/* Mascot Image with Enhanced Animation */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: [0, -12, 0],
          rotate: [0, -3, 3, -3, 0]
        }}
        transition={{
          scale: { duration: 0.5, delay: 0.3 },
          opacity: { duration: 0.5, delay: 0.3 },
          y: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          },
          rotate: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }
        }}
        whileHover={{ scale: 1.15, y: -18 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          trackButtonClick('Feedback Mascot', 'global');
          navigate('/feedback');
        }}
        className="w-20 h-20 md:w-28 md:h-28 relative cursor-pointer"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />

        <img
          src="/monkey-mascot.png"
          alt="Feedback Mascot"
          className="relative w-full h-full object-contain drop-shadow-2xl"
        />
        {/* Notification Dot with Pulse */}
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-3 border-white rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-xs font-black">!</span>
        </motion.span>
      </motion.button>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <LanguageProvider>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <MaintenanceCheck>
                <BackgroundDecorations />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<><Navbar /><LandingPage /></>} />
                    <Route path="/auth" element={<><Navbar /><AuthPage /></>} />
                    <Route path="/onboarding" element={<ProtectedRoute skipOnboarding><OnboardingFlow /></ProtectedRoute>} />
                    <Route path="/onboarding-debug" element={<ProtectedRoute skipOnboarding><OnboardingDebugPage /></ProtectedRoute>} />
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
                      <Route path="community" element={<AdminCommunity />} />
                      <Route path="decks" element={<AdminCommunity />} />
                      <Route path="members" element={<AdminMembers />} />
                      <Route path="promotions" element={<AdminPromotions />} />
                      <Route path="notification" element={<AdminNotification />} />
                      <Route path="feedback" element={<AdminFeedback />} />
                      <Route path="subscriptions" element={<AdminSubscriptions />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="click-analytics" element={<AdminClickAnalyticsPage />} />
                      <Route path="onboarding" element={<AdminOnboarding />} />
                    </Route>

                    <Route
                      path="/admin/decks/:deckId/subdecks/:subdeckId"
                      element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }
                    >
                      <Route index element={<AdminSubDeckDetail />} />
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
                      path="/vocab-challenge"
                      element={
                        <ProtectedRoute>
                          <><Navbar /><VocabChallengePage /></>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/classroom"
                      element={
                        <ProtectedRoute>
                          <><Navbar /><LobbyPage /></>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lobby"
                      element={
                        <ProtectedRoute>
                          <><Navbar /><LobbyPage /></>
                        </ProtectedRoute>
                      }
                    />
                    {/* Learning Now Routes */}
                    <Route
                      path="/learning-session"
                      element={
                        <ProtectedRoute>
                          <LearningSessionPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/learning-results"
                      element={
                        <ProtectedRoute>
                          <LearningResultsPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Multiplayer Route */}
                    <Route
                      path="/multiplayer"
                      element={
                        <ProtectedRoute>
                          <MultiplayerPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Demo/Preview Routes */}
                    <Route
                      path="/folder-bundle-preview-demo"
                      element={
                        <>
                          <Navbar />
                          <FolderBundlePreviewDemo />
                        </>
                      }
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<><Navbar /><NotFoundPage /></>} />
                  </Routes>

                  {/* Global Feedback Mascot Widget */}
                  <FeedbackMascot />
                </BrowserRouter>
              </MaintenanceCheck>
            </AuthProvider>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider >
    </QueryClientProvider >
  );
};

export default App;
