
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal, Hash } from "lucide-react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import AvatarGenerator from "../user/AvatarGenerator";
import ModernImageSlider from "@/components/ui/modern-image-slider";
import ModernVideoPlayer from "@/components/ui/modern-video-player";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import DeletePostDialog from "./DeletePostDialog";
import EditPostModal from "./EditPostModal";
import PostDetail from "./PostDetail";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Like {
	user: string;
	anonymousAlias: string;
	createdAt: Date;
}

interface PostCardProps {
	post: {
		_id: string;
		user: string;
		anonymousAlias: string;
		avatarEmoji: string;
		content: string;
		images: string[];
		videos: string[];
		likes: Like[];
		shareCount: number;
		createdAt: Date;
		tags: string[];
		comments: any[];
	};
	onUpdate?: (postId: string) => void;
	onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onDelete }) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [liked, setLiked] = useState(
		post.likes?.some((like) => like.user === user?._id) || false
	);
	const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
	const [shareCount, setShareCount] = useState(post.shareCount || 0);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showPostDetail, setShowPostDetail] = useState(false);

	const isOwner = user?._id === post.user;

	const handleLike = async () => {
		if (!user) {
			toast.error("Please login to like posts");
			return;
		}

		try {
			const token = localStorage.getItem("token");
			const response = await axios.put(
				`/api/posts/${post._id}/like`,
				{},
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			);
			setLiked(!liked);
			setLikeCount(response.data.likes.length);
		} catch (error) {
			console.error("Error liking post:", error);
			toast.error("Failed to like post");
		}
	};

	const handleShare = async () => {
		if (!user) {
			toast.error("Please login to share posts");
			return;
		}

		try {
			if (navigator.share) {
				await navigator.share({
					title: "Check out this post on UnderKover",
					text: post.content.substring(0, 100),
					url: window.location.href,
				});
			} else {
				await navigator.clipboard.writeText(window.location.href);
				toast.success("Link copied to clipboard!");
			}
			
			const token = localStorage.getItem("token");
			await axios.post(
				`/api/posts/${post._id}/share`,
				{},
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			);
			setShareCount(prev => prev + 1);
		} catch (error) {
			console.error("Error sharing post:", error);
			toast.error("Failed to share post");
		}
	};

	const handleTagClick = (tag: string) => {
		navigate(`/tags/${tag.toLowerCase()}`);
	};

	const handleDeletePost = () => {
		if (onDelete) {
			onDelete(post._id);
		}
		setShowDeleteDialog(false);
	};

	const handleUpdatePost = () => {
		if (onUpdate) {
			onUpdate(post._id);
		}
		setShowEditModal(false);
	};

	return (
		<>
			<Card className="mb-4 bg-card border-border">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<AvatarGenerator
								emoji={post.avatarEmoji}
								nickname={post.anonymousAlias}
								size="sm"
							/>
							<div>
								<p className="font-semibold text-sm">{post.anonymousAlias}</p>
								<p className="text-xs text-muted-foreground">
									{formatDistanceToNow(new Date(post.createdAt), {
										addSuffix: true,
									})}
								</p>
							</div>
						</div>
						{isOwner && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => setShowEditModal(true)}>
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem 
										onClick={() => setShowDeleteDialog(true)}
										className="text-red-600 focus:text-red-600"
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</CardHeader>

				<CardContent 
					className="pb-2 cursor-pointer" 
					onClick={() => setShowPostDetail(true)}
				>
					<p className="text-sm mb-3 leading-relaxed whitespace-pre-wrap">
						{post.content}
					</p>

					{/* Tags */}
					{post.tags && post.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mb-3">
							{post.tags.map((tag, index) => (
								<Badge
									key={index}
									variant="secondary"
									className="text-xs cursor-pointer hover:bg-purple-600/20 bg-purple-600/10 text-purple-400 border-purple-600/30"
									onClick={(e) => {
										e.stopPropagation();
										handleTagClick(tag);
									}}
								>
									<Hash className="w-3 h-3 mr-1" />
									{tag}
								</Badge>
							))}
						</div>
					)}

					{/* Images */}
					{post.images && post.images.length > 0 && (
						<div className="mb-3">
							<ModernImageSlider images={post.images} />
						</div>
					)}

					{/* Videos */}
					{post.videos && post.videos.length > 0 && (
						<div className="space-y-3 mb-3">
							{post.videos.map((video, index) => (
								<ModernVideoPlayer key={index} src={video} />
							))}
						</div>
					)}
				</CardContent>

				<CardFooter className="pt-2">
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center space-x-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLike}
								className={`flex items-center space-x-1 ${
									liked ? "text-red-500" : "text-muted-foreground"
								}`}
							>
								<Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
								<span className="text-xs">{likeCount}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowPostDetail(true)}
								className="flex items-center space-x-1 text-muted-foreground"
							>
								<MessageCircle className="h-4 w-4" />
								<span className="text-xs">{post.comments?.length || 0}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={handleShare}
								className="flex items-center space-x-1 text-muted-foreground"
							>
								<Share2 className="h-4 w-4" />
								<span className="text-xs">{shareCount}</span>
							</Button>
						</div>
					</div>
				</CardFooter>
			</Card>

			{/* Modals and Dialogs */}
			<DeletePostDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onDelete={handleDeletePost}
			/>

			<EditPostModal
				open={showEditModal}
				onOpenChange={setShowEditModal}
				post={post}
				onSuccess={handleUpdatePost}
			/>

			<PostDetail
				open={showPostDetail}
				onOpenChange={setShowPostDetail}
				postId={post._id}
			/>
		</>
	);
};

export default PostCard;
