import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { likePost, deletePost } from "@/lib/api";
import CommentItem from "./CommentItem";
import ReplyCommentModal from "./ReplyCommentModal";
import EditPostModal from "./EditPostModal";
import DeletePostDialog from "./DeletePostDialog";
import ModernImageSlider from "@/components/ui/modern-image-slider";
import ModernVideoPlayer from "@/components/ui/modern-video-player";

interface PostCardProps {
  post: any;
  currentUserId: string;
  onRefresh: () => void;
  showOptions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserId, 
  onRefresh,
  showOptions = true
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLiked, setIsLiked] = useState(post.likes?.some((like: any) => like.user === currentUserId));
  const [showComments, setShowComments] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLike = async () => {
    try {
      await likePost(post._id);
      setIsLiked(!isLiked);
      onRefresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error liking post",
        description: "Could not like the post. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
      onRefresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting post",
        description: "Could not delete the post. Please try again.",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleTagClick = (tagName: string) => {
    navigate(`/tags/${tagName}`);
  };

  return (
    <Card className="border-purple-500/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
              <span className="text-lg">{post.avatarEmoji}</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{post.anonymousAlias}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {showOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {post.user === user?.id ? (
                  <>
                    <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        {post.content && (
          <p className="text-foreground leading-relaxed">{post.content}</p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Media Content */}
        {post.images && post.images.length > 0 && (
          <ModernImageSlider images={post.images} />
        )}

        {post.videos && post.videos.length > 0 && (
          <div className="space-y-2">
            {post.videos.map((video: any, index: number) => (
              <ModernVideoPlayer
                key={index}
                src={video.url}
                thumbnail={video.thumbnail}
              />
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? "text-red-500" : "text-muted-foreground"
              } hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{post.likes?.length || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments?.length || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-3">
            {post.comments?.map((comment: any) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onReply={() => setShowReplyModal(true)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Modals */}
      <ReplyCommentModal
        open={showReplyModal}
        onOpenChange={setShowReplyModal}
      />

      <EditPostModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        post={post}
        onSuccess={onRefresh}
      />

      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </Card>
  );
};

export default PostCard;
