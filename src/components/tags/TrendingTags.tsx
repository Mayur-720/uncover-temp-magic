import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Hash, ChevronRight } from "lucide-react";
import { getTrendingTags, Tag } from "@/lib/api-tags";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface TrendingTagsProps {
	className?: string;
	limit?: number;
	onTagClick?: (tag: string) => void;
}

const TrendingTags: React.FC<TrendingTagsProps> = ({
	className,
	limit = 5,
	onTagClick,
}) => {
	const [tags, setTags] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchTrendingTags = async () => {
			try {
				setIsLoading(true);
				const response = await getTrendingTags({ limit });
				setTags(response.tags);
			} catch (error) {
				console.error("Error fetching trending tags:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTrendingTags();
	}, [limit]);

	const handleTagClick = (tag: Tag) => {
		if (onTagClick) {
			onTagClick(tag.name);
		} else {
			navigate(`/tags/${tag.name}`);
		}
	};

	const handleViewAll = () => {
		navigate("/trending-tags");
	};

	if (isLoading) {
		return (
			<div className={cn("w-full", className)}>
				<div className="flex justify-between items-center mb-2 px-2">
					<TrendingUp className="h-4 w-4 text-purple-500" />
					<ChevronRight className="h-4 w-4 text-purple-400" />
				</div>
				<div className="overflow-hidden">
					<div className="flex gap-2 px-2 overflow-x-auto scrollbar-hide">
						{[...Array(limit)].map((_, i) => (
							<div
								key={i}
								className="h-8 w-20 bg-gray-800 rounded-full animate-pulse flex-shrink-0"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (tags.length === 0) return null;

	return (
		<div className={cn("w-full", className)}>
			<div className="flex justify-between items-center mb-2 px-2">
				<TrendingUp className="h-4 w-4 text-purple-500" />
				<button onClick={handleViewAll}>
					<ChevronRight className="h-4 w-4 text-purple-400 hover:text-purple-300" />
				</button>
			</div>

			{/* ✅ Scrollable tag list inside a locked wrapper */}
			<div className="overflow-hidden">
				<div className="flex gap-2 px-2 overflow-x-auto scrollbar-hide">
					{tags.map((tag) => (
						<Button
							key={tag._id}
							variant="outline"
							size="sm"
							onClick={() => handleTagClick(tag)}
							className="flex-shrink-0 h-8 px-3 rounded-full border text-xs font-medium
								bg-purple-500/20 text-purple-400 border-purple-500/30
								hover:bg-purple-500/30 hover:shadow-md hover:shadow-purple-500/20 flex items-center"
						>
							<Hash className="h-3 w-3 mr-1" />
							<span className="truncate max-w-[80px] sm:max-w-none">
								{tag.displayName}
							</span>
							<span className="ml-1 text-xs opacity-75 hidden sm:inline">
								{tag.postCount > 999 ? "999+" : tag.postCount}
							</span>
						</Button>
					))}
				</div>
			</div>
		</div>
	);
};

export default TrendingTags;
