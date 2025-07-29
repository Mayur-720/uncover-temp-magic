
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPostById } from '@/lib/api'; // Assume this API exists
import PostCard from './PostCard';
import AppShell from '../layout/AppShell';

const PostDetail: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}> = ({ open, onOpenChange, postId }) => {
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId && open,
  });

  if (!open) return null;

  if (isLoading) return <div className='text-2xl flex flex-row min-h-screen justify-center items-center'>Loading...</div>;
  if (error) return <div className='text-red-500 flex flex-row min-h-screen justify-center items-center'>Error loading post</div>;
  if (!post) return <div className='text-red-500 flex flex-row min-h-screen justify-center items-center'>Post not found</div>;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <button 
            onClick={() => onOpenChange(false)}
            className="float-right text-gray-400 hover:text-white"
          >
            ×
          </button>
          <PostCard 
            post={{ 
              ...post, 
              user: post.author?._id || '', 
              username: post.author?.username || '',
              anonymousAlias: post.author?.anonymousAlias || 'Anonymous', 
              avatarEmoji: post.author?.avatarEmoji || '🎭', 
              comments: post.comments || [], 
              likes: post.likes?.map((userId: string) => ({ 
                user: userId,
                anonymousAlias: 'Anonymous',
                createdAt: new Date()
              })) || [],
              createdAt: new Date(post.createdAt),
              tags: post.tags || []
            }} 
            onUpdate={() => {}} 
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
