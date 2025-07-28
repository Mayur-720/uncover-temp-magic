import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Hash, X, Plus } from "lucide-react";
import { searchTags, Tag } from "@/lib/api-tags";
import { Input } from "@/components/ui/input";

interface TagSuggestionProps {
	content: string;
	selectedTags: string[];
	onTagsChange: (tags: string[]) => void;
	maxTags?: number;
}

const TagSuggestion: React.FC<TagSuggestionProps> = ({
	content,
	selectedTags,
	onTagsChange,
	maxTags = 5,
}) => {
	const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
	const [customTagInput, setCustomTagInput] = useState("");
	const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);

	useEffect(() => {
		if (content.trim()) {
			generateTagSuggestions(content);
		}
	}, [content]);

	const generateTagSuggestions = async (text: string) => {
		try {
			// Extract potential hashtags from content
			const hashtags = extractHashtags(text);

			// Extract keywords for suggestions
			const keywords = extractKeywords(text);

			// Search for existing tags based on keywords
			const suggestions = new Set<Tag>();

			for (const keyword of keywords) {
				if (keyword.length >= 2) {
					try {
						const response = await searchTags(keyword);
						response.tags.forEach((tag) => suggestions.add(tag));
					} catch (error) {
						// Continue with other keywords if one fails
					}
				}
			}

			// Add hashtag-based suggestions
			for (const hashtag of hashtags) {
				try {
					const response = await searchTags(hashtag);
					response.tags.forEach((tag) => suggestions.add(tag));
				} catch (error) {
					// Continue with other hashtags if one fails
				}
			}

			setSuggestedTags(Array.from(suggestions).slice(0, 10));
		} catch (error) {
			console.error("Error generating tag suggestions:", error);
		}
	};

	const extractHashtags = (text: string): string[] => {
		const hashtagRegex = /#[\w]+/g;
		const matches = text.match(hashtagRegex);
		return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
	};

	const extractKeywords = (text: string): string[] => {
		// Remove hashtags and common words
		const cleanText = text.replace(/#[\w]+/g, "").toLowerCase();
		const commonWords = [
			"the",
			"a",
			"an",
			"and",
			"or",
			"but",
			"in",
			"on",
			"at",
			"to",
			"for",
			"of",
			"with",
			"by",
			"is",
			"are",
			"was",
			"were",
			"be",
			"been",
			"have",
			"has",
			"had",
			"do",
			"does",
			"did",
			"will",
			"would",
			"should",
			"could",
			"can",
			"may",
			"might",
			"must",
			"shall",
			"this",
			"that",
			"these",
			"those",
			"i",
			"you",
			"he",
			"she",
			"it",
			"we",
			"they",
			"me",
			"him",
			"her",
			"us",
			"them",
			"my",
			"your",
			"his",
			"her",
			"its",
			"our",
			"their",
		];

		return cleanText
			.split(/\s+/)
			.filter((word) => word.length > 2 && !commonWords.includes(word))
			.slice(0, 5);
	};

	const handleTagSelect = (tag: Tag) => {
		if (selectedTags.length < maxTags && !selectedTags.includes(tag.name)) {
			onTagsChange([...selectedTags, tag.name]);
		}
	};

	const handleTagRemove = (tagName: string) => {
		onTagsChange(selectedTags.filter((tag) => tag !== tagName));
	};

	const handleCustomTagAdd = () => {
		const tagName = customTagInput.trim().toLowerCase();
		if (
			tagName &&
			!selectedTags.includes(tagName) &&
			selectedTags.length < maxTags
		) {
			onTagsChange([...selectedTags, tagName]);
			setCustomTagInput("");
			setIsAddingCustomTag(false);
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
			other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
		};
		return colors[category] || colors.other;
	};

	return (
		<Card className="mt-4">
			<CardContent className="p-4">
				<div className="flex items-center justify-between mb-3">
					<h4 className="font-medium text-foreground flex items-center">
						<Hash className="h-4 w-4 mr-1" />
						Tags ({selectedTags.length}/{maxTags})
					</h4>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsAddingCustomTag(!isAddingCustomTag)}
					>
						<Plus className="h-3 w-3 mr-1" />
						Add Custom
					</Button>
				</div>

				{/* Selected Tags */}
				{selectedTags.length > 0 && (
					<div className="mb-3">
						<p className="text-sm text-muted-foreground mb-2">Selected tags:</p>
						<div className="flex flex-wrap gap-2">
							{selectedTags.map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
									className="bg-purple-500/20 text-purple-400 border-purple-500/30"
								>
									<Hash className="h-3 w-3 mr-1" />
									{tag}
									<Button
										variant="ghost"
										size="sm"
										className="ml-1 h-auto p-0 hover:bg-transparent"
										onClick={() => handleTagRemove(tag)}
									>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							))}
						</div>
					</div>
				)}

				{/* Custom Tag Input */}
				{isAddingCustomTag && (
					<div className="mb-3">
						<div className="flex space-x-2">
							<Input
								placeholder="Enter custom tag..."
								value={customTagInput}
								onChange={(e) => setCustomTagInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										handleCustomTagAdd();
									}
								}}
								className="flex-1"
							/>
							<Button
								onClick={handleCustomTagAdd}
								disabled={!customTagInput.trim()}
							>
								Add
							</Button>
						</div>
					</div>
				)}

				{/* Suggested Tags */}
				{suggestedTags.length > 0 && (
					<div>
						<p className="text-sm text-muted-foreground mb-2">
							Suggested tags:
						</p>
						<div className="flex flex-wrap gap-2">
							{suggestedTags.map((tag) => (
								<Badge
									key={tag._id}
									variant="outline"
									className={`cursor-pointer hover:scale-105 transition-transform ${getCategoryColor(
										tag.category
									)} ${
										selectedTags.includes(tag.name)
											? "opacity-50 cursor-not-allowed"
											: ""
									}`}
									onClick={() => handleTagSelect(tag)}
								>
									<Hash className="h-3 w-3 mr-1" />
									{tag.displayName}
									<span className="ml-1 text-xs opacity-75">
										{tag.postCount}
									</span>
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default TagSuggestion;
