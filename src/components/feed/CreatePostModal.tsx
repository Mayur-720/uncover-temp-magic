
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, VideoIcon, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import TagInput from "@/components/tags/TagInput";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentFeedType: "global" | "college" | "area";
  initialTags?: string[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  currentFeedType,
  initialTags = []
}) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [tags, setTags] = useState<string[]>(initialTags);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    maxFiles: 5,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 5) {
        toast({
          title: "Too many files",
          description: "You can only upload up to 5 images.",
          variant: "destructive",
        });
        return;
      }

      const uploadPromises = acceptedFiles.map(async (file) => {
        const objectURL = URL.createObjectURL(file);
        return objectURL;
      });

      try {
        const newImages = await Promise.all(uploadPromises);
        setImages(prevImages => [...prevImages, ...newImages]);
      } catch (error) {
        toast({
          title: "Image upload failed",
          description: "There was an error uploading your images. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const videoId = uuidv4();
      const formData = new FormData();
      formData.append('video', file);
      formData.append('videoId', videoId);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/video`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (!response.ok) {
          console.error('Video upload failed:', response.status, response.statusText);
          toast({
            title: "Video upload failed",
            description: "There was an error uploading your video. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const data = await response.json();

        if (data.error) {
          console.error('Video upload error:', data.error);
          toast({
            title: "Video processing failed",
            description: data.error,
            variant: "destructive",
          });
          return;
        }

        setVideos([{
          url: data.url,
          thumbnail: data.thumbnail,
          duration: data.duration,
          size: file.size
        }]);

        toast({
          title: "Video uploaded successfully",
          description: "Your video is now live.",
        });

      } catch (error) {
        console.error('Video upload error:', error);
        toast({
          title: "Video upload failed",
          description: "There was an error uploading your video. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      toast({
        title: "Content required",
        description: "Please add some content to your post",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Post created!",
        description: "Your truth has been shared.",
      });
      
      onSuccess();
      setContent("");
      setImages([]);
      setVideos([]);
      setTags([]);
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Share Your Truth</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post">Your Message</Label>
            <Textarea
              id="post"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Add Images (up to 5)</Label>
            <div {...getImageRootProps()} className={cn(
              "border-dashed border-2 rounded-md p-4 text-center cursor-pointer",
              isImageDragActive ? "border-purple-500 bg-purple-50" : "border-border bg-card hover:bg-muted"
            )}>
              <input {...getImageInputProps()} />
              {isImageDragActive ? (
                <p className="text-purple-500">Drop the images here ...</p>
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click or drag images to upload</p>
                </>
              )}
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <div key={index} className="relative w-32 h-24 rounded-md overflow-hidden">
                  <img src={image} alt={`Uploaded ${index + 1}`} className="object-cover w-full h-full" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 bg-background/50 hover:bg-background/80 text-muted-foreground"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Add Video (1 max)</Label>
            <div {...getVideoRootProps()} className={cn(
              "border-dashed border-2 rounded-md p-4 text-center cursor-pointer",
              isVideoDragActive ? "border-purple-500 bg-purple-50" : "border-border bg-card hover:bg-muted"
            )}>
              <input {...getVideoInputProps()} />
              {isVideoDragActive ? (
                <p className="text-purple-500">Drop the video here ...</p>
              ) : (
                <>
                  <VideoIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click or drag video to upload</p>
                </>
              )}
            </div>
            {videos.length > 0 && (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <video src={videos[0].url} controls className="object-cover w-full h-full" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 bg-background/50 hover:bg-background/80 text-muted-foreground"
                  onClick={() => setVideos([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <TagInput
            tags={tags}
            onTagsChange={setTags}
            placeholder="Add tags to help others find your post..."
            maxTags={5}
          />
          
          <Button disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Share Your Truth
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
