import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/auth.store";
import { Bell, User } from "lucide-react-native";
import { theme } from "../theme";

export function TopBar() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        
        {/* Lado Izquierdo: Solo Avatar */}
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
            ) : (
              <User size={18} color={theme.colors.brandBlue} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        {/* Centro: Logo Imagen */}
        <View style={styles.centerSection} pointerEvents="none">
          <Image 
            source={require('../../assets/examina-logo-transparent-cropped.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </View>

        {/* Lado Derecho: Notificaciones */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 56, 
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.brandSky,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  centerSection: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  logoImage: {
    height: 36, // Logo más grande
    width: 160, // Ancho suficiente para contenerlo
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
});
