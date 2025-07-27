import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import PostDetails from './pages/PostDetails';
import NotFound from './pages/NotFound';
import AppShell from './components/layout/AppShell';
import CollegeRegistration from './pages/CollegeRegistration';
import TagsPage from "@/pages/TagsPage";
import TagPostsPage from "@/pages/TagPostsPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <QueryClient>
            <Toaster />
            <Routes>
              <Route path="/" element={<AppShell><Index /></AppShell>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
              <Route path="/admin" element={<AppShell><Admin /></AppShell>} />
              <Route path="/posts/:postId" element={<AppShell><PostDetails /></AppShell>} />
              <Route path="/college-registration" element={<AppShell><CollegeRegistration /></AppShell>} />
              <Route path="/tags" element={<AppShell><TagsPage /></AppShell>} />
              <Route path="/tags/:tagName" element={<AppShell><TagPostsPage /></AppShell>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </QueryClient>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
