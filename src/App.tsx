
import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter as Router, Outlet, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SmoothScrollProvider from "./components/providers/SmoothScrollProvider";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProfilePage from "@/pages/ProfilePage";
import RecognitionsPage from "@/pages/RecognitionsPage";
import GhostCircles from "@/pages/GhostCircles";
import ReferralPage from "@/pages/ReferralPage";
import MatchesPage from "@/pages/MatchesPage";
import WhispersPage from "@/pages/WhispersPage";
import NotFound from "@/pages/NotFound";
import AppShell from "@/components/layout/AppShell";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import AdminPanel from "@/pages/AdminPanel";
import AdminLogin from "@/pages/AdminLogin";
import AdminMatchStats from "@/pages/AdminMatchStats";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import InvitePage from "@/pages/InvitePage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import TagPostsPage from "./pages/TagPostsPage";
import TrendingTagsPage from "./pages/TrendingTagsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PostDetail } from "@/components/feed/PostDetail";
import { LoginSuccessAnimation } from "@/components/animations/LoginSuccessAnimation";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

function GlobalApp() {
	const {
		showLoginAnimation,
		setShowLoginAnimation,
		showOnboarding,
		setShowOnboarding,
	} = useAuth();
	const [loginAnimNavPending, setLoginAnimNavPending] = useState(false);
	const navigate = useNavigate();

	return (
		<>
			{/* Render animation overlay if login/registration success */}
			{showLoginAnimation && (
				<div className="fixed inset-0 z-[99] bg-black/70 flex items-center justify-center">
					<LoginSuccessAnimation
						onComplete={() => {
							setShowLoginAnimation(false);
							setLoginAnimNavPending(true);
							// Use navigate for SPA transition
							navigate("/");
						}}
					/>
				</div>
			)}

			{/* Onboarding Modal */}
			<OnboardingModal
				open={showOnboarding}
				onOpenChange={setShowOnboarding}
			/>

			<Routes>
				{/* Public routes */}
				<Route path="/post/:id" element={<PostDetail />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/privacy-policy" element={<PrivacyPolicy />} />
				<Route path="/terms-and-conditions" element={<TermsAndConditions />} />
				<Route path="/admin/login" element={<AdminLogin />} />

				{/* Combined root route with public and protected sub-routes */}
				<Route
					path="/"
					element={
						<AppShell>
							<Outlet />
						</AppShell>
					}
				>
					<Route index element={<Index />} /> {/* Public */}
					<Route path="invite/:circleId" element={<InvitePage />} />{" "}
					{/* Public */}
					<Route
						path="profile"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="profile/:userId"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="ghost-circles"
						element={
							<ProtectedRoute>
								<GhostCircles />
							</ProtectedRoute>
						}
					/>
					<Route
						path="chat"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="chat/:userId"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="whispers"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="recognitions"
						element={
							<ProtectedRoute>
								<RecognitionsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="referrals"
						element={
							<ProtectedRoute>
								<ReferralPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="matches"
						element={
							<ProtectedRoute>
								<MatchesPage />
							</ProtectedRoute>
						}
					/>
				</Route>

				{/* Admin routes */}
				<Route
					path="/admin"
					element={
						<ProtectedAdminRoute>
							<AdminPanel />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path="/admin/match-stats"
					element={
						<ProtectedAdminRoute>
							<AdminMatchStats />
						</ProtectedAdminRoute>
					}
				/>

				{/* 404 route */}
				<Route path="*" element={<NotFound />} />
			</Routes>
			<Toaster />
		</>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<SmoothScrollProvider>
				<AdminProvider>
					<Router
						future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
					>
						<AuthProvider>
							<div className="App">
								<GlobalApp />
							</div>
						</AuthProvider>
					</Router>
				</AdminProvider>
			</SmoothScrollProvider>
		</QueryClientProvider>
	);
}

export default App;
