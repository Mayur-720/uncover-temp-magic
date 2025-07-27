
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { Toaster } from './components/ui/toaster';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import AppShell from './components/layout/AppShell';
import TagsPage from "@/pages/TagsPage";
import TagPostsPage from "@/pages/TagPostsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<AppShell><Index /></AppShell>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<AppShell><ProfilePage /></AppShell>} />
              <Route path="/profile/:userId" element={<AppShell><ProfilePage /></AppShell>} />
              <Route path="/admin" element={<AppShell><AdminPanel /></AppShell>} />
              <Route path="/tags" element={<AppShell><TagsPage /></AppShell>} />
              <Route path="/tags/:tagName" element={<AppShell><TagPostsPage /></AppShell>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
