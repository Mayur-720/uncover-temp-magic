
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Hash } from "lucide-react";
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
  onTagClick
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getTrendingTags({ limit });
        setTags(response.tags);
      } catch (error) {
        console.error("Error fetching trending tags:", error);
        setError("Failed to load trending tags");
        setTags([]);
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
      // Default behavior: navigate to tag posts
      navigate(`/tags/${tag.name}`);
    }
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
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return colors[category] || colors.other;
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <TrendingUp className="h-4 w-4 text-purple-500" />
        <div className="flex space-x-2">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-800 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center space-x-2 text-red-400", className)}>
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className={cn("flex items-center space-x-2 text-gray-400", className)}>
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm">No trending tags found</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-medium text-gray-300">Trending:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Button
            key={tag._id}
            variant="outline"
            size="sm"
            onClick={() => handleTagClick(tag)}
            className={cn(
              "h-8 px-3 rounded-full border transition-all duration-200 hover:scale-105",
              getCategoryColor(tag.category),
              "hover:shadow-lg hover:shadow-current/20"
            )}
          >
            <Hash className="h-3 w-3 mr-1" />
            <span className="font-medium">{tag.displayName}</span>
            <span className="ml-1 text-xs opacity-75">
              {tag.postCount > 999 ? '999+' : tag.postCount}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTags;
