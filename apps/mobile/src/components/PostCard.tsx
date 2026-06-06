import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Heart, MessageSquare, MoreHorizontal } from "lucide-react-native";
import { theme } from "../theme";
import type { CommunityPost } from "../viewmodels/useCommunityViewModel";
import { Image } from "expo-image";

interface PostCardProps {
  post: CommunityPost;
  onPress?: () => void;
  onReactionToggle: (postId: string, reacted: boolean) => void;
}

export function PostCard({ post, onPress, onReactionToggle }: PostCardProps) {
  const [reacted, setReacted] = useState(!!post.currentUserReaction);
  const [reactionCount, setReactionCount] = useState(post._count?.reactions || 0);

  const handleReaction = () => {
    // Optimistic UI update
    const newReacted = !reacted;
    setReacted(newReacted);
    setReactionCount(prev => newReacted ? prev + 1 : Math.max(0, prev - 1));
    onReactionToggle(post.id, newReacted);
  };

  const avatarUrl = post.author.photoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.author.profile.username);
  
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, { 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
          <View>
            <Text style={styles.authorName}>
              {post.author.displayName || post.author.profile.username}
            </Text>
            <Text style={styles.authorUsername}>@{post.author.profile.username} • {formattedDate}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color={theme.colors.textSoft} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {post.title && <Text style={styles.postTitle}>{post.title}</Text>}
        <Text style={styles.postText}>{post.content}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.actionButton, reacted && styles.actionButtonActive]} 
          onPress={handleReaction}
        >
          <Heart 
            size={18} 
            color={reacted ? "#ef4444" : theme.colors.textSoft} 
            fill={reacted ? "#ef4444" : "transparent"} 
          />
          <Text style={[styles.actionText, reacted && { color: "#ef4444" }]}>
            {reactionCount > 0 ? reactionCount : "Me gusta"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <MessageSquare size={18} color={theme.colors.textSoft} />
          <Text style={styles.actionText}>
            {post._count?.comments > 0 ? post._count.comments : "Comentar"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.space3,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.borderLight,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  authorUsername: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textSoft,
  },
  moreButton: {
    padding: theme.spacing.space1,
  },
  content: {
    marginBottom: theme.spacing.space4,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.space1,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space6,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space2,
  },
  actionButtonActive: {
    // additional styles if active
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
});
