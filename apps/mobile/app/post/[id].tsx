import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { theme } from "../../src/theme";
import { usePostDetail, useCommunityActions } from "../../src/viewmodels/useCommunityViewModel";
import { PostCard } from "../../src/components/PostCard";
import { Image } from "expo-image";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { post, comments, isLoading, refetch } = usePostDetail(id);
  const { addComment, toggleReaction, isSubmitting } = useCommunityActions();
  const [commentText, setCommentText] = useState("");

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment(id, commentText);
      setCommentText("");
      refetch();
    } catch (e) {
      // Error handled by viewmodel
    }
  };

  const handleReactionToggle = async (postId: string, reacted: boolean) => {
    try {
      await toggleReaction(postId, reacted ? "LIKE" : "LIKE");
    } catch (e) {
      // Handled in viewmodel
    }
  };

  const renderComment = ({ item }: { item: any }) => {
    const avatarUrl = item.author.photoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(item.author.profile.username);
    const date = new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
      <View style={styles.commentCard}>
        <Image source={{ uri: avatarUrl }} style={styles.commentAvatar} contentFit="cover" />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthorName}>{item.author.displayName || item.author.profile.username}</Text>
            <Text style={styles.commentDate}>{date}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicación</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.brandBlue} />
          </View>
        ) : !post ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Publicación no encontrada.</Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.postWrapper}>
                <PostCard post={post} onReactionToggle={handleReactionToggle} />
                <View style={styles.commentsHeader}>
                  <Text style={styles.commentsTitle}>Comentarios ({comments.length})</Text>
                </View>
              </View>
            }
            renderItem={renderComment}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sé el primero en comentar.</Text>
              </View>
            }
          />
        )}

        {post && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un comentario..."
              placeholderTextColor={theme.colors.textSoft}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled]}
              onPress={handleSendComment}
              disabled={!commentText.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.space2,
    paddingVertical: theme.spacing.space3,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    padding: theme.spacing.space2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSoft,
  },
  postWrapper: {
    marginBottom: theme.spacing.space2,
  },
  commentsHeader: {
    paddingHorizontal: theme.spacing.space4,
    paddingVertical: theme.spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  commentCard: {
    flexDirection: "row",
    padding: theme.spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.borderLight,
    marginRight: theme.spacing.space3,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: theme.spacing.space1,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  commentDate: {
    fontSize: 12,
    color: theme.colors.textSoft,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  emptyContainer: {
    padding: theme.spacing.space8,
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.textSoft,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.space3,
    paddingVertical: theme.spacing.space3,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.space4,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    maxHeight: 100,
    minHeight: 40,
    color: theme.colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.brandBlue,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.space3,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
});
