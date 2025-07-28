import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient } from "@/context/QueryContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import { SmoothScrollProvider } from "@/context/SmoothScrollContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";
import AppShell from "@/components/layout/AppShell";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import NotFound from "@/pages/NotFound";
import GhostCircles from "@/pages/GhostCircles";
import WhispersPage from "@/pages/WhispersPage";
import MatchesPage from "@/pages/MatchesPage";
import RecognitionsPage from "@/pages/RecognitionsPage";
import ReferralPage from "@/pages/ReferralPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPanel from "@/pages/AdminPanel";
import AdminLogin from "@/pages/AdminLogin";
import AdminMatchStats from "@/pages/AdminMatchStats";
import InvitePage from "@/pages/InvitePage";

import TagsPage from "./pages/TagsPage";

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <AdminProvider>
          <SmoothScrollProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/invite/:inviteCode" element={<InvitePage />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                    <Route index element={<Index />} />
                    <Route path="ghost-circles" element={<GhostCircles />} />
                    <Route path="tags" element={<TagsPage />} />
                    <Route path="tags/:tagName" element={<TagsPage />} />
                    <Route path="whispers" element={<WhispersPage />} />
                    <Route path="matches" element={<MatchesPage />} />
                    <Route path="recognitions" element={<RecognitionsPage />} />
                    <Route path="referrals" element={<ReferralPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                  
                  <Route path="/admin" element={<ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>} />
                  <Route path="/admin/match-stats" element={<ProtectedAdminRoute><AdminMatchStats /></ProtectedAdminRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </div>
          </SmoothScrollProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
