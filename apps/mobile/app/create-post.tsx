import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Send } from "lucide-react-native";
import { theme } from "../src/theme";
import { useCommunityActions } from "../src/viewmodels/useCommunityViewModel";

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const { createPost, isSubmitting } = useCommunityActions();

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      await createPost(content);
      router.back();
    } catch (error) {
      // Error handled by viewmodel
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Publicación</Text>
          <TouchableOpacity 
            onPress={handlePost} 
            style={[styles.publishButton, (!content.trim() || isSubmitting) && styles.publishButtonDisabled]}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.publishText}>Publicar</Text>
                <Send size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="¿Qué estás estudiando o pensando hoy?"
            placeholderTextColor={theme.colors.textSoft}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.space4,
    paddingVertical: theme.spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  iconButton: {
    padding: theme.spacing.space2,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: theme.spacing.space4,
    paddingVertical: theme.spacing.space2,
    borderRadius: 20,
    gap: theme.spacing.space2,
  },
  publishButtonDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.7,
  },
  publishText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  inputContainer: {
    flex: 1,
    padding: theme.spacing.space4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: theme.colors.text,
    lineHeight: 26,
  },
});
