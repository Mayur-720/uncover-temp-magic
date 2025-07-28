import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFeedPosts } from "@/lib/api-feed";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import EmptyFeedMessage from "./EmptyFeedMessage";
import WeeklyPrompt from "./WeeklyPrompt";
import TrendingTags from "@/components/tags/TrendingTags";

interface GlobalFeedProps {
  currentUserId: string;
  feedType: "global" | "college" | "area";
}

const GlobalFeed: React.FC<GlobalFeedProps> = ({ currentUserId, feedType }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [after, setAfter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { toast } = useToast();

  const fetchPosts = useCallback(async (initialLoad = true) => {
    if (!hasMore && !initialLoad) return;

    setIsLoading(true);
    try {
      const response = await getFeedPosts({
        feedType,
        after: initialLoad ? null : after,
        college: feedType === "college" ? localStorage.getItem("userCollege") : undefined,
        area: feedType === "area" ? localStorage.getItem("userArea") : undefined,
      });

      if (initialLoad) {
        setPosts(response.posts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...response.posts]);
      }

      setHasMore(response.hasMore);
      setAfter(response.posts.length > 0 ? response.posts[response.posts.length - 1]._id : null);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [feedType, after, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, feedType]);

  const handleLoadMore = () => {
    fetchPosts(false);
  };

  const handleRefresh = () => {
    setPosts([]);
    setHasMore(true);
    setAfter(null);
    fetchPosts();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Weekly Prompt */}
      <WeeklyPrompt />

      {/* Trending Tags */}
      <Card className="border-purple-500/20 bg-card/50">
        <CardContent className="p-4">
          <TrendingTags limit={5} />
        </CardContent>
      </Card>

      {/* Create Post Button */}
      <Card className="border-purple-500/20 bg-card/50">
        <CardContent className="p-4">
          <Button
            onClick={() => setShowCreatePost(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Your Truth
          </Button>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      <div className="space-y-6">
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyFeedMessage feedType={feedType} />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onRefresh={handleRefresh}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {!isLoading && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Load More
          </Button>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSuccess={handleRefresh}
        currentFeedType={feedType}
      />
    </div>
  );
};

export default GlobalFeed;
