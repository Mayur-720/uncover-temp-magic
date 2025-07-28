import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Hash, TrendingUp, Clock, Users } from "lucide-react";
import {
	getTrendingTags,
	searchTags,
	getPostsByTag,
	Tag,
} from "@/lib/api-tags";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/feed/PostCard";
import { useToast } from "@/hooks/use-toast";

const TagsPage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Tag[]>([]);
	const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [tagPosts, setTagPosts] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoadingPosts, setIsLoadingPosts] = useState(false);
	const [activeTimeFilter, setActiveTimeFilter] = useState<
		"today" | "week" | "month" | "all"
	>("all");

	const { user } = useAuth();
	const { toast } = useToast();
	const navigate = useNavigate();
	const { tagName } = useParams();

	useEffect(() => {
		fetchTrendingTags();
		if (tagName) {
			setSelectedTag(tagName);
			fetchPostsByTag(tagName);
		}
	}, [tagName]);

	const fetchTrendingTags = async (
		timeFilter: "today" | "week" | "month" | "all" = "all"
	) => {
		try {
			const response = await getTrendingTags({ limit: 20, timeFilter });
			setTrendingTags(response.tags);
		} catch (error) {
			console.error("Error fetching trending tags:", error);
		}
	};

	const handleSearch = async (query: string) => {
		if (!query.trim()) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const response = await searchTags(query);
			setSearchResults(response.tags);
		} catch (error) {
			console.error("Error searching tags:", error);
			toast({
				title: "Error",
				description: "Failed to search tags",
				variant: "destructive",
			});
		} finally {
			setIsSearching(false);
		}
	};

	const fetchPostsByTag = async (tagName: string) => {
		setIsLoadingPosts(true);
		try {
			const response = await getPostsByTag({ tagName, limit: 20 });
			setTagPosts(response.posts);
		} catch (error) {
			console.error("Error fetching posts by tag:", error);
			toast({
				title: "Error",
				description: "Failed to fetch posts for this tag",
				variant: "destructive",
			});
		} finally {
			setIsLoadingPosts(false);
		}
	};

	const handleTagClick = (tag: Tag) => {
		setSelectedTag(tag.name);
		setSearchQuery("");
		setSearchResults([]);
		navigate(`/tags/${tag.name}`);
		fetchPostsByTag(tag.name);
	};

	const getCategoryColor = (category: string) => {
		const colors: { [key: string]: string } = {
			confession: "bg-red-500/20 text-red-400 border-red-500/30",
			crush: "bg-pink-500/20 text-pink-400 border-pink-500/30",
			controversy: "bg-orange-500/20 text-orange-400 border-orange-500/30",
			government: "bg-blue-500/20 text-blue-400 border-blue-500/30",
			danger: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
			lifestyle: "bg-green-500/20 text-green-400 border-green-500/30",
			work: "bg-purple-500/20 text-purple-400 border-purple-500/30",
			relationship: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
			other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
		};
		return colors[category] || colors.other;
	};

	const handleTimeFilterChange = (
		filter: "today" | "week" | "month" | "all"
	) => {
		setActiveTimeFilter(filter);
		fetchTrendingTags(filter);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto p-4">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						<Hash className="inline h-8 w-8 mr-2 text-purple-500" />
						Tags
					</h1>
					<p className="text-muted-foreground">
						Discover trending topics and explore posts by tags
					</p>
				</div>

				{/* Search Bar */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search tags..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								handleSearch(e.target.value);
							}}
							className="pl-9"
						/>
					</div>
				</div>

				{/* Search Results */}
				{searchQuery && (
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Search className="h-5 w-5 mr-2" />
								Search Results
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isSearching ? (
								<div className="text-center py-4">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
								</div>
							) : searchResults.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{searchResults.map((tag) => (
										<Badge
											key={tag._id}
											variant="outline"
											className={`cursor-pointer hover:scale-105 transition-transform ${getCategoryColor(
												tag.category
											)}`}
											onClick={() => handleTagClick(tag)}
										>
											<Hash className="h-3 w-3 mr-1" />
											{tag.displayName}
											<span className="ml-1 text-xs opacity-75">
												{tag.postCount}
											</span>
										</Badge>
									))}
								</div>
							) : (
								<p className="text-muted-foreground text-center py-4">
									No tags found matching "{searchQuery}"
								</p>
							)}
						</CardContent>
					</Card>
				)}

				{/* Trending Tags */}
				{!selectedTag && (
					<Card className="mb-6">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center">
									<TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
									Trending Tags
								</CardTitle>
								<div className="flex space-x-2">
									{(["today", "week", "month", "all"] as const).map(
										(filter) => (
											<Button
												key={filter}
												variant={
													activeTimeFilter === filter ? "default" : "outline"
												}
												size="sm"
												onClick={() => handleTimeFilterChange(filter)}
												className="capitalize"
											>
												{filter === "all" ? "All time" : filter}
											</Button>
										)
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{trendingTags.map((tag) => (
									<Card
										key={tag._id}
										className="cursor-pointer hover:shadow-lg transition-shadow border-border"
										onClick={() => handleTagClick(tag)}
									>
										<CardContent className="p-4">
											<div className="flex items-center justify-between mb-2">
												<Badge className={getCategoryColor(tag.category)}>
													{tag.category}
												</Badge>
												<span className="text-sm text-muted-foreground">
													Score: {tag.trendingScore}
												</span>
											</div>
											<h3 className="font-semibold text-foreground flex items-center">
												<Hash className="h-4 w-4 mr-1" />
												{tag.displayName}
											</h3>
											<div className="flex items-center mt-2 text-sm text-muted-foreground">
												<Users className="h-3 w-3 mr-1" />
												{tag.postCount} posts
												<Clock className="h-3 w-3 ml-3 mr-1" />
												{new Date(tag.updatedAt).toLocaleDateString()}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Tag Posts */}
				{selectedTag && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Hash className="h-5 w-5 mr-2" />
								Posts tagged with "{selectedTag}"
								<Button
									variant="outline"
									size="sm"
									className="ml-4"
									onClick={() => {
										setSelectedTag(null);
										navigate("/tags");
									}}
								>
									Back to Tags
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoadingPosts ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
								</div>
							) : tagPosts.length > 0 ? (
								<div className="space-y-4">
									{tagPosts.map((post) => (
										<PostCard
											key={post._id}
											post={post}
											currentUserId={user?._id}
											showOptions={true}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">
										No posts found for this tag
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};

export default TagsPage;
