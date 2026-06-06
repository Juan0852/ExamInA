import { useState, useCallback, useEffect } from "react";
import { apiService } from "../services/api.service";

import { io, Socket } from "socket.io-client";

// ... existing types ...
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
  fileAssets?: any[];
  sharedExam?: any;
  examSession?: any;
}

let socketInstance: Socket | null = null;
export function getCommunitySocket() {
  if (!socketInstance) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.5:3000";
    // Usually socket server is on the same host but without the /api prefix, depending on setup
    // Assuming backend runs on 3000 and socket server is attached to it
    const socketUrl = apiUrl.replace("/api", "");
    socketInstance = io(socketUrl + "/community", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socketInstance;
}

export function useFeed(tab: string = "new") {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const response = await apiService.get(`/community/posts?tab=${tab}`);
      if (response?.data) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    setIsLoading(true);
    fetchFeed();
  }, [fetchFeed, tab]);

  useEffect(() => {
    const socket = getCommunitySocket();
    
    const handleNewPost = (newPost: CommunityPost) => {
      // If we are in "new" tab, we prepend the post.
      // Or we can just show a toast "New posts available" 
      // For now, let's prepend it if it's the "new" tab
      if (tab === "new") {
        setPosts(prev => {
          if (prev.find(p => p.id === newPost.id)) return prev;
          return [newPost, ...prev];
        });
      } else {
        // Just refetch or ignore depending on tab logic
      }
    };

    socket.on("new_post", handleNewPost);

    return () => {
      socket.off("new_post", handleNewPost);
    };
  }, [tab]);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    fetchFeed();
  }, [fetchFeed]);

  return { posts, isLoading, isRefreshing, refetch, setPosts };
}

export function useCommunityActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = async (
    content: string, 
    type: CommunityPostType = "TEXT", 
    title?: string,
    imageKeys?: string[],
    sharedExamId?: string,
    examSessionId?: string
  ) => {
    setIsSubmitting(true);
    try {
      const response = await apiService.post("/community/posts", { 
        content, 
        type, 
        title,
        imageKeys,
        sharedExamId,
        examSessionId
      });
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
