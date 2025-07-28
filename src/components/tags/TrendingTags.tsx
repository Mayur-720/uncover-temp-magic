
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Hash, ArrowRight } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        setIsLoading(true);
        const response = await getTrendingTags({ limit });
        setTags(response.tags);
      } catch (error) {
        console.error("Error fetching trending tags:", error);
        // Set default tags if API fails
        setTags([
          { _id: '1', name: 'confession', displayName: 'Confession', postCount: 0, trendingScore: 0, isActive: true, createdAt: '', updatedAt: '' },
          { _id: '2', name: 'crush', displayName: 'Crush', postCount: 0, trendingScore: 0, isActive: true, createdAt: '', updatedAt: '' },
          { _id: '3', name: 'secret', displayName: 'Secret', postCount: 0, trendingScore: 0, isActive: true, createdAt: '', updatedAt: '' },
          { _id: '4', name: 'advice', displayName: 'Advice', postCount: 0, trendingScore: 0, isActive: true, createdAt: '', updatedAt: '' },
          { _id: '5', name: 'relationship', displayName: 'Relationship', postCount: 0, trendingScore: 0, isActive: true, createdAt: '', updatedAt: '' }
        ]);
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

  const handleViewAll = () => {
    navigate('/trending-tags');
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <TrendingUp className="h-4 w-4 text-purple-500" />
        <div className="flex space-x-2">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-muted rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-muted-foreground">Trending:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {tags.slice(0, limit).map((tag) => (
            <Button
              key={tag._id}
              variant="outline"
              size="sm"
              onClick={() => handleTagClick(tag)}
              className={cn(
                "h-8 px-3 rounded-full border transition-all duration-200 hover:scale-105",
                "bg-purple-500/20 text-purple-400 border-purple-500/30",
                "hover:shadow-lg hover:shadow-purple-500/20"
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
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleViewAll}
        className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
      >
        <span className="text-xs">View All</span>
        <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default TrendingTags;
