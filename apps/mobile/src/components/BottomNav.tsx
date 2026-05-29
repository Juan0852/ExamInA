import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";

interface BottomNavProps {
  activeTab: "dashboard" | "subjects" | "friends" | "profile";
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();

  const tabs = [
    { id: "dashboard" as const, label: "Inicio", icon: "home", route: "/dashboard" },
    { id: "subjects" as const, label: "Materias", icon: "book", route: "/subjects" },
    { id: "friends" as const, label: "Amigos", icon: "people", route: "/friends" },
    { id: "profile" as const, label: "Perfil", icon: "person", route: "/profile" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => router.replace(tab.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? (tab.icon as any) : (`${tab.icon}-outline` as any)}
                size={22}
                color={isActive ? theme.colors.brandCyan : theme.colors.textSoft}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.colors.text : theme.colors.textSoft },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    paddingTop: 10,
    ...theme.shadows.md,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    width: "22%",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
