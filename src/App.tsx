import React, { useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { AuthProvider } from "./context/AuthContext";
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
import AppShell from "@/components/AppShell";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminMatchStats from "@/components/admin/AdminMatchStats";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import InvitePage from "@/pages/InvitePage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import TagPostsPage from "./pages/TagPostsPage";
import TrendingTagsPage from "./pages/TrendingTagsPage";

function App() {
	useEffect(() => {
		document.documentElement.classList.add("dark");
	}, []);

	return (
		<AdminProvider>
			<SmoothScrollProvider>
				<QueryClient>
					<BrowserRouter>
						<AuthProvider>
							<div className="min-h-screen bg-gray-950 text-white">
								<Routes>
									<Route path="/" element={<AppShell />}>
										<Route index element={<Index />} />
										<Route path="profile/:userId" element={<ProfilePage />} />
										<Route path="profile" element={<ProfilePage />} />
										<Route path="recognitions" element={<RecognitionsPage />} />
										<Route path="ghost-circles" element={<GhostCircles />} />
										<Route path="referrals" element={<ReferralPage />} />
										<Route path="matches" element={<MatchesPage />} />
										<Route path="whispers" element={<WhispersPage />} />
										<Route path="tags/:tagName" element={<TagPostsPage />} />
										<Route path="trending-tags" element={<TrendingTagsPage />} />
									</Route>
									<Route path="/login" element={<Login />} />
									<Route path="/register" element={<Register />} />
									<Route path="/forgot-password" element={<Login />} />
									<Route path="/reset-password" element={<ResetPassword />} />
									<Route path="/verify-email" element={<VerifyEmail />} />
									<Route path="/invite/:referralCode" element={<InvitePage />} />
									<Route path="/privacy-policy" element={<PrivacyPolicy />} />
									<Route path="/terms-and-conditions" element={<TermsAndConditions />} />
									<Route path="/admin" element={<AdminLogin />} />
									<Route
										path="/admin/dashboard"
										element={
											<ProtectedAdminRoute>
												<AdminPanel />
											</ProtectedAdminRoute>
										}
									/>
									<Route
										path="/admin/matches"
										element={
											<ProtectedAdminRoute>
												<AdminMatchStats />
											</ProtectedAdminRoute>
										}
									/>
									<Route path="*" element={<NotFound />} />
								</Routes>
							</div>
						</AuthProvider>
					</BrowserRouter>
				</QueryClient>
			</SmoothScrollProvider>
		</AdminProvider>
	);
}

export default App;
