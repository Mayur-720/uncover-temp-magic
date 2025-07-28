
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Hash, ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppShell from "@/components/layout/AppShell";
import PostCard from "@/components/feed/PostCard";
import { getPostsByTag } from "@/lib/api-tags";

const TagPostsPage: React.FC = () => {
  const { tagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tag-posts', tagName],
    queryFn: () => getPostsByTag({ tagName: tagName! }),
    enabled: !!tagName,
    onSuccess: (data) => {
      setPosts(data.posts || []);
    }
  });

  const handleRefresh = () => {
    // Refresh logic if needed
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-muted rounded" />
                        <div className="w-24 h-3 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-muted rounded" />
                      <div className="w-3/4 h-4 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load posts for this tag</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="flex items-center space-x-2">
            <Hash className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">#{tagName}</h1>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId=""
              onRefresh={handleRefresh}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-8">
            <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts found for #{tagName}</p>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TagPostsPage;
