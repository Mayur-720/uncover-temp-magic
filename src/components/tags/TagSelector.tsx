
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Hash } from "lucide-react";
import { getAllTags, Tag } from "@/lib/api-tags";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  className?: string;
}

// Fallback predefined tags in case API fails
const FALLBACK_TAGS = [
  { name: 'confession', displayName: 'Confession' },
  { name: 'crush', displayName: 'Crush' },
  { name: 'secret', displayName: 'Secret' },
  { name: 'controversy', displayName: 'Controversy' },
  { name: 'rumor', displayName: 'Rumor' },
  { name: 'advice', displayName: 'Advice' },
  { name: 'vent', displayName: 'Vent' },
  { name: 'mentalhealth', displayName: 'MentalHealth' },
  { name: 'relationship', displayName: 'Relationship' },
  { name: 'campuslife', displayName: 'CampusLife' }
];

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  maxTags = 3,
  className
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await getAllTags();
        if (response.tags && response.tags.length > 0) {
          setAvailableTags(response.tags);
        } else {
          // Use fallback tags if API returns empty
          setAvailableTags(FALLBACK_TAGS.map(tag => ({
            ...tag,
            _id: tag.name,
            postCount: 0,
            trendingScore: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })));
        }
      } catch (error) {
        console.error("Error fetching tags, using fallback:", error);
        // Use fallback tags if API fails
        setAvailableTags(FALLBACK_TAGS.map(tag => ({
          ...tag,
          _id: tag.name,
          postCount: 0,
          trendingScore: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium text-gray-200 mb-2">Tags (Loading...)</div>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-800 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-200">
          Tags ({selectedTags.length}/{maxTags})
        </div>
        {selectedTags.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onTagsChange([])}
            className="text-xs text-gray-400 hover:text-gray-200 h-auto p-1"
          >
            Clear all
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tagName => {
            const tag = availableTags.find(t => t.name === tagName);
            return (
              <Badge
                key={tagName}
                variant="secondary"
                className="flex items-center gap-1 bg-purple-500/20 text-purple-400 border-purple-500/30 px-2 py-1"
              >
                <Hash className="h-3 w-3" />
                <span className="text-xs">{tag?.displayName || tagName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(tagName)}
                  className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {availableTags.map(tag => (
          <Button
            key={tag._id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleTagToggle(tag.name)}
            disabled={selectedTags.includes(tag.name) || (!selectedTags.includes(tag.name) && selectedTags.length >= maxTags)}
            className={cn(
              "h-9 px-3 rounded-lg transition-all duration-200 text-xs",
              selectedTags.includes(tag.name)
                ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-gray-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Hash className="h-3 w-3 mr-1" />
            <span className="truncate">{tag.displayName}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagSelector;
