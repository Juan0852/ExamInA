import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../src/theme";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.brandBlue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
