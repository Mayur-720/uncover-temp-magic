import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import GhostCirclePage from "./pages/GhostCirclePage";
import PostDetail from "./components/feed/PostDetail";
import TrendingTagsPage from "./pages/TrendingTagsPage";
import TagPostsPage from "./pages/TagPostsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AuthProvider>
          <AdminProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/ghost-circle/:circleId" element={<GhostCirclePage />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/trending-tags" element={<TrendingTagsPage />} />
              <Route path="/tags/:tagName" element={<TagPostsPage />} />
            </Routes>
            <Toaster />
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
