import React, { useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "../../src/theme";
import { useFeed, useCommunityActions } from "../../src/viewmodels/useCommunityViewModel";
import { PostCard } from "../../src/components/PostCard";
import { Rss } from "lucide-react-native";

export default function FeedScreen() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("new");
  const { posts, isLoading, isRefreshing, refetch } = useFeed(currentTab);
  const { toggleReaction } = useCommunityActions();

  const handleReactionToggle = async (postId: string, reacted: boolean) => {
    try {
      await toggleReaction(postId, reacted ? "LIKE" : "LIKE"); // Simplification for now
    } catch (e) {
      // Handled in viewmodel or silent failure
    }
  };

  const tabs = [
    { id: "new", label: "Nuevos" },
    { id: "foryou", label: "Para ti" },
    { id: "friends", label: "Amigos" },
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.hero}>
        <View style={styles.iconBubble}>
          <Rss size={32} color={theme.colors.brandBlue} />
        </View>
        <Text style={styles.title}>Comunidad</Text>
        <Text style={styles.subtitle}>
          Conecta con otros estudiantes, comparte tus dudas y celebra tus logros.
        </Text>
      </View>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, currentTab === tab.id && styles.activeTabButton]}
            onPress={() => setCurrentTab(tab.id)}
          >
            <Text style={[styles.tabText, currentTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brandBlue} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={refetch} 
              tintColor={theme.colors.brandBlue} 
            />
          }
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onPress={() => router.push(`/post/${item.id}`)}
              onReactionToggle={handleReactionToggle}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay publicaciones aún en esta sección.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 120, // For the bottom nav and FAB
  },
  hero: {
    alignItems: "center",
    backgroundColor: "#F2FAFF",
    padding: theme.spacing.space6,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2FAFF",
    paddingHorizontal: theme.spacing.space4,
    paddingBottom: theme.spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: "#D8ECFF",
    justifyContent: "space-around",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  activeTabButton: {
    backgroundColor: theme.colors.brandBlue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
  activeTabText: {
    color: theme.colors.white,
  },
  iconBubble: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.space3,
    ...theme.shadows.sm,
  },
  title: {
    color: theme.colors.brandNavy,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: theme.spacing.space1,
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emptyContainer: {
    padding: theme.spacing.space8,
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.textSoft,
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
  },
});
