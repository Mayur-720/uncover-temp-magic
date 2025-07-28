
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Hash, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppShell from "@/components/layout/AppShell";
import { getTrendingTags } from "@/lib/api-tags";

const TrendingTagsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ['trending-tags'],
    queryFn: () => getTrendingTags({ limit: 20 }),
  });

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
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-muted rounded" />
                        <div className="w-16 h-3 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-muted rounded" />
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
            <p className="text-muted-foreground">Failed to load trending tags</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const tags = trendingData?.tags || [];

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
            <TrendingUp className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Trending Tags</h1>
          </div>
        </div>

        <div className="space-y-4">
          {tags.map((tag, index) => (
            <Card 
              key={tag._id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/tags/${tag.name}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Hash className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">#{tag.displayName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                      #{index + 1}
                    </Badge>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-8">
            <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No trending tags found</p>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TrendingTagsPage;
