import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useAuthStore } from "../src/stores/auth.store";
import { updateProfile, UpdateProfilePayload } from "../src/services/mobile-auth.service";
import { ApiError } from "../src/services/api-error";
import { theme } from "../src/theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, token, refreshToken, setSession } = useAuthStore();
  const profile = user?.profile;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [targetUniversity, setTargetUniversity] = useState(profile?.targetUniversity || "");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
