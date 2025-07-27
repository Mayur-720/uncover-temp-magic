
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Hash, Plus } from "lucide-react";
import { searchTags } from "@/lib/api-tags";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  maxTags = 5,
  className
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract hashtags from text
  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  };

  // Auto-detect hashtags when input changes
  useEffect(() => {
    const hashtags = extractHashtags(inputValue);
    if (hashtags.length > 0) {
      const newTags = [...new Set([...tags, ...hashtags])];
      if (newTags.length !== tags.length) {
        onTagsChange(newTags.slice(0, maxTags));
        setInputValue("");
      }
    }
  }, [inputValue, tags, onTagsChange, maxTags]);

  // Search for tag suggestions
  useEffect(() => {
    const searchSuggestions = async () => {
      if (inputValue.length >= 2 && !inputValue.startsWith('#')) {
        try {
          const response = await searchTags(inputValue);
          setSuggestions(response.tags.filter(tag => !tags.includes(tag.name)));
        } catch (error) {
          console.error("Error searching tags:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(searchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue, tags]);

  const addTag = (tagName: string) => {
    const cleanTag = tagName.toLowerCase().trim();
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      onTagsChange([...tags, cleanTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      confession: "bg-red-500/20 text-red-400 border-red-500/30",
      crush: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      controversy: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      government: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      danger: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      lifestyle: "bg-green-500/20 text-green-400 border-green-500/30",
      work: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      relationship: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return colors[category] || colors.other;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
          >
            <Hash className="h-3 w-3 mr-1" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={tags.length < maxTags ? placeholder : "Max tags reached"}
          disabled={tags.length >= maxTags}
          className="pr-10"
        />
        {inputValue && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => addTag(inputValue)}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion._id}
              onClick={() => addTag(suggestion.name)}
              className={cn(
                "w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center justify-between",
                getCategoryColor(suggestion.category)
              )}
            >
              <div className="flex items-center space-x-2">
                <Hash className="h-3 w-3" />
                <span className="font-medium">{suggestion.displayName}</span>
              </div>
              <span className="text-xs opacity-75">
                {suggestion.postCount} posts
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} tags • Use # for hashtags or search existing tags
      </p>
    </div>
  );
};

export default TagInput;
