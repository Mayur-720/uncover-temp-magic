
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Hash, TrendingUp, Calendar, Clock } from "lucide-react";
import { getTrendingTags, searchTags } from "@/lib/api-tags";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const TagsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch trending tags or search results
  const { data: tagsData, isLoading } = useQuery({
    queryKey: ['tags', debouncedSearch ? 'search' : 'trending', debouncedSearch, timeFilter],
    queryFn: async () => {
      if (debouncedSearch) {
        return await searchTags(debouncedSearch);
      }
      return await getTrendingTags({ limit: 20, timeFilter });
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      confession: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
      crush: "bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30",
      controversy: "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30",
      government: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
      danger: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
      lifestyle: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
      work: "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
      relationship: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30"
    };
    return colors[category] || colors.other;
  };

  const handleTagClick = (tagName: string) => {
    navigate(`/tags/${tagName}`);
  };

  const timeFilterOptions = [
    { value: 'today', label: 'Today', icon: Clock },
    { value: 'week', label: 'This Week', icon: Calendar },
    { value: 'month', label: 'This Month', icon: Calendar },
    { value: 'all', label: 'All Time', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Hash className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-foreground">Trending Tags</h1>
          </div>
          <p className="text-muted-foreground">
            Discover what's trending in the underground
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          {!debouncedSearch && (
            <div className="flex flex-wrap gap-2">
              {timeFilterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={timeFilter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFilter(option.value as TimeFilter)}
                    className={cn(
                      "transition-all duration-200",
                      timeFilter === option.value
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-border hover:border-purple-500/50"
                    )}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tagsData?.tags?.map((tag, index) => (
              <div
                key={tag._id}
                className="animate-fade-in opacity-100 cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleTagClick(tag.name)}
              >
                <div className={cn(
                  "bg-card rounded-lg border p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg",
                  getCategoryColor(tag.category)
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span className="font-semibold text-lg">{tag.displayName}</span>
                    </div>
                    <span className="text-xs opacity-75 uppercase tracking-wider">
                      {tag.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-75">
                      {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">{tag.trendingScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tagsData?.tags?.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {debouncedSearch ? `No tags found for "${debouncedSearch}"` : "No trending tags found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;
