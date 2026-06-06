import { useState, useCallback, useEffect } from "react";
import { apiService } from "../services/api.service";

export type CommunityReactionType = "LIKE" | "USEFUL" | "CONGRATS" | "INTERESTING" | "SAVED";
export type CommunityPostType = "TEXT" | "QUESTION" | "EXAM_RESULT" | "PROGRESS_UPDATE" | "TIP" | "DOUBT";

export interface CommunityAuthor {
  id: string;
  displayName: string | null;
  photoUrl: string | null;
  profile: {
    username: string;
    level: number;
  };
}

export interface CommunityComment {
  id: string;
  content: string;
  author: CommunityAuthor;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  type: CommunityPostType;
  title: string | null;
  content: string;
  author: CommunityAuthor;
  createdAt: string;
  _count: {
    comments: number;
    reactions: number;
  };
  currentUserReaction?: {
    id: string;
    type: CommunityReactionType;
  };
}

export function useFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const response = await apiService.get("/community/posts");
      if (response?.data) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    fetchFeed();
  }, [fetchFeed]);

  return { posts, isLoading, isRefreshing, refetch, setPosts };
}

export function useCommunityActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = async (content: string, type: CommunityPostType = "TEXT", title?: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiService.post("/community/posts", { content, type, title });
      return response.data as CommunityPost;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReaction = async (postId: string, type: CommunityReactionType = "LIKE") => {
    try {
      const response = await apiService.post(`/community/posts/${postId}/reactions`, { type });
      return response.data; // { reacted: boolean }
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      throw error;
    }
  };

  const addComment = async (postId: string, content: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiService.post(`/community/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createPost,
    toggleReaction,
    addComment,
    isSubmitting
  };
}

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      // Assuming a GET /community/posts/:id exists in the backend. 
      // If not, we might need to add it to the API, but for now let's mock or use the API if it exists
      const response = await apiService.get(`/community/posts/${postId}`);
      if (response?.data) {
        setPost(response.data.post);
        setComments(response.data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch post details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { post, comments, isLoading, refetch: fetchDetails };
}
