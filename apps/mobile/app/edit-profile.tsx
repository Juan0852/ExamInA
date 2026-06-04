import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useAuthStore } from "../src/stores/auth.store";
import { updateProfile, UpdateProfilePayload } from "../src/services/mobile-auth.service";
import { fileUploadService } from "../src/services/file-upload.service";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { ApiError } from "../src/services/api-error";
import { theme } from "../src/theme";
import { Camera } from "lucide-react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, token, refreshToken, setSession } = useAuthStore();
  const profile = user?.profile;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [targetUniversity, setTargetUniversity] = useState(profile?.targetUniversity || "");
  
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(profile?.bannerUrl || "");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePickImage = async (type: "AVATAR" | "BANNER") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: type === "AVATAR" ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        // Mock a file object for the service
        const file = {
          uri,
          name: uri.split('/').pop() || 'upload.jpg',
          type: 'image/jpeg'
        } as any;

        if (type === "AVATAR") {
          setIsUploadingPhoto(true);
          const uploadResult = await fileUploadService.uploadLocalImage({
            uri,
            fileName: uri.split('/').pop() || 'upload.jpg',
            contentType: 'image/jpeg',
            purpose: 'AVATAR',
            visibility: 'PUBLIC'
          });
          setPhotoUrl(uploadResult.url);
          setIsUploadingPhoto(false);
        } else {
          setIsUploadingBanner(true);
          const uploadResult = await fileUploadService.uploadLocalImage({
            uri,
            fileName: uri.split('/').pop() || 'upload.jpg',
            contentType: 'image/jpeg',
            purpose: 'BANNER',
            visibility: 'PUBLIC'
          });
          setBannerUrl(uploadResult.url);
          setIsUploadingBanner(false);
        }
      }
    } catch (err) {
      setErrorMsg("Error al seleccionar o subir la imagen.");
      setIsUploadingPhoto(false);
      setIsUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    if (!token || !user) return;
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      const payload: UpdateProfilePayload = {};
      
      // Enviar solo lo que ha cambiado o lo que está definido
      if (displayName !== user.displayName) payload.displayName = displayName;
      if (username !== profile?.username) payload.username = username.toLowerCase();
      if (bio !== profile?.bio) payload.bio = bio;
      if (targetUniversity !== profile?.targetUniversity) payload.targetUniversity = targetUniversity;
      if (photoUrl !== user.photoUrl) payload.photoUrl = photoUrl;
      if (bannerUrl !== profile?.bannerUrl) payload.bannerUrl = bannerUrl;

      if (Object.keys(payload).length === 0) {
        router.back();
        return;
      }

      const response = await updateProfile(payload);
      
      // Actualizar el estado global
      if (response.data?.user) {
        await setSession(token, response.data.user, refreshToken);
      }
      
      router.back();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Ocurrió un error al actualizar el perfil.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Visual Header Editing */}
        <View style={styles.imagesEditorContainer}>
          <TouchableOpacity 
            style={styles.bannerEditor} 
            onPress={() => handlePickImage("BANNER")}
            disabled={isUploadingBanner || isUploadingPhoto}
          >
            <Image 
              source={bannerUrl ? { uri: bannerUrl } : require("../assets/images/galaxy-banner.png")} 
              style={styles.bannerImage} 
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              {isUploadingBanner ? <ActivityIndicator color="#fff" /> : <Camera color="#fff" size={24} />}
            </View>
          </TouchableOpacity>

          <View style={styles.avatarEditorWrapper}>
            <TouchableOpacity 
              style={styles.avatarEditor}
              onPress={() => handlePickImage("AVATAR")}
              disabled={isUploadingBanner || isUploadingPhoto}
            >
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>{(displayName || username || "E").charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={[styles.imageOverlay, { borderRadius: 40 }]}>
                {isUploadingPhoto ? <ActivityIndicator color="#fff" /> : <Camera color="#fff" size={20} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre Real</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Ej. Juan Pérez"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre de Usuario</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Ej. juanperez123"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.helperText}>Solo letras minúsculas, números y guiones bajos.</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Universidad / Objetivo</Text>
          <TextInput
            style={styles.input}
            value={targetUniversity}
            onChangeText={setTargetUniversity}
            placeholder="Ej. UNAM, MIT, etc."
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Biografía</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos un poco sobre ti..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  imagesEditorContainer: {
    marginBottom: 32,
    position: "relative",
  },
  bannerEditor: {
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditorWrapper: {
    position: "absolute",
    bottom: -24,
    left: 20,
    padding: 4,
    backgroundColor: "#ffffff",
    borderRadius: 50,
  },
  avatarEditor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "#cbd5e1",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.brandBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fca5a5",
    marginBottom: 20,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0f172a",
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  saveButton: {
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
