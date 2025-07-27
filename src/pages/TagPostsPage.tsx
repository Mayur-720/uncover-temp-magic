
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hash, Loader, Plus } from "lucide-react";
import { getPostsByTag } from "@/lib/api-tags";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import { useAuth } from "@/context/AuthContext";

const TagPostsPage = () => {
  const { tagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['tag-posts', tagName],
    queryFn: ({ pageParam }) => getPostsByTag({
      tagName: tagName!,
      limit: 20,
      after: pageParam
    }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      const posts = lastPage.posts;
      return posts.length > 0 ? posts[posts.length - 1]._id : undefined;
    },
    initialPageParam: null,
    enabled: !!tagName,
  });

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePostCreated = () => {
    refetch();
    setIsCreatePostOpen(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      confession: "text-red-400",
      crush: "text-pink-400",
      controversy: "text-orange-400",
      government: "text-blue-400",
      danger: "text-yellow-400",
      lifestyle: "text-green-400",
      work: "text-purple-400",
      relationship: "text-indigo-400",
      other: "text-gray-400"
    };
    return colors[category] || colors.other;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
          <Loader className="h-8 w-8 animate-spin text-purple-500" />
          <p className="animate-pulse">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load posts</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-purple-500" />
                <h1 className="text-xl font-bold text-foreground">
                  {tagName}
                </h1>
              </div>
            </div>
            <Button
              disabled={!isAuthenticated}
              onClick={() => setIsCreatePostOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {allPosts.length === 0 ? (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No posts found for #{tagName}
            </h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share something with this tag!
            </p>
            <Button
              onClick={() => setIsCreatePostOpen(true)}
              disabled={!isAuthenticated}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {allPosts.map((post, index) => (
              <div
                key={post._id}
                className="animate-fade-in opacity-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard post={post} />
              </div>
            ))}
            
            <div ref={loadMoreRef} />
            
            {isFetchingNextPage && (
              <div className="flex justify-center p-4">
                <Loader className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            )}
            
            {!hasNextPage && allPosts.length > 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">You've seen all posts for #{tagName}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreatePostModal
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        onSuccess={handlePostCreated}
        currentFeedType="global"
        initialTags={tagName ? [tagName] : []}
      />
    </div>
  );
};

export default TagPostsPage;
