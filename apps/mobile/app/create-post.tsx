import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Send, Image as ImageIcon, FileText } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../src/theme";
import { useCommunityActions } from "../src/viewmodels/useCommunityViewModel";

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasSharedExam, setHasSharedExam] = useState(false);
  
  const { createPost, isSubmitting } = useCommunityActions();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleToggleExam = () => {
    setHasSharedExam(!hasSharedExam);
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/feed");
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedImage && !hasSharedExam) return;
    try {
      // In a real scenario, we would upload the selectedImage to S3 here
      // and get an assetId back. We mock this process for now.
      const imageKeys = selectedImage ? ["mocked_asset_id"] : undefined;
      const sharedExamId = hasSharedExam ? "mock_exam_id" : undefined;
      
      await createPost(content, "TEXT", undefined, imageKeys, sharedExamId);
      handleClose();
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
          <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Publicación</Text>
          <TouchableOpacity 
            onPress={handlePost} 
            style={[styles.publishButton, (!content.trim() && !selectedImage && !hasSharedExam || isSubmitting) && styles.publishButtonDisabled]}
            disabled={(!content.trim() && !selectedImage && !hasSharedExam) || isSubmitting}
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
          
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {hasSharedExam && (
            <View style={styles.examPreviewContainer}>
              <View style={styles.examPreviewContent}>
                <FileText size={24} color={theme.colors.brandBlue} />
                <View>
                  <Text style={styles.examPreviewTitle}>Simulacro Adjunto</Text>
                  <Text style={styles.examPreviewDesc}>Los demás podrán resolver este examen.</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setHasSharedExam(false)}>
                <X size={20} color={theme.colors.textSoft} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={handlePickImage}>
            <ImageIcon size={24} color={theme.colors.brandBlue} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleToggleExam}>
            <FileText size={24} color={theme.colors.brandNavy} />
          </TouchableOpacity>
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
  imagePreviewContainer: {
    marginTop: theme.spacing.space4,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 16,
  },
  examPreviewContainer: {
    marginTop: theme.spacing.space4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: theme.spacing.space3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  examPreviewContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space3,
  },
  examPreviewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.brandNavy,
  },
  examPreviewDesc: {
    fontSize: 12,
    color: theme.colors.textSoft,
  },
  toolbar: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.space4,
    paddingVertical: theme.spacing.space3,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.space4,
  },
  toolbarButton: {
    padding: theme.spacing.space2,
  },
});
