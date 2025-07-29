
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface DeletePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

const DeletePostDialog: React.FC<DeletePostDialogProps> = ({
  open,
  onOpenChange,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onDelete();
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-red-500/20">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <AlertDialogTitle className="text-white">Delete Post</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete this post? This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="my-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <Trash2 size={16} />
            <span>This will permanently remove your post and all its comments, likes, and shares.</span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete Post
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePostDialog;
