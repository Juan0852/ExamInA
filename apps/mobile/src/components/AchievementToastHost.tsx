import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing
} from "react-native-reanimated";
import { X } from "lucide-react-native";
import { useAchievementToastStore } from "../stores/achievement-toast.store";
import { AchievementMedal, medalThemes } from "./achievements/AchievementMedal";
import type { Achievement } from "../achievements/types";

const { width } = Dimensions.get("window");
const TOAST_DURATION_MS = 4000;

export function AchievementToastHost() {
  const queue = useAchievementToastStore((state) => state.queue);

  return (
    <View style={styles.hostContainer} pointerEvents="box-none">
      {queue.map((achievement, index) => (
        <AchievementToast 
          key={achievement.id} 
          achievement={achievement} 
          index={index} 
        />
      ))}
    </View>
  );
}

import { Gesture, GestureDetector } from "react-native-gesture-handler";

function AchievementToast({ achievement, index }: { achievement: Achievement; index: number }) {
  const dismissAchievement = useAchievementToastStore((state) => state.dismissAchievement);
  const translateY = useSharedValue(-150);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const theme = medalThemes[achievement.code] || medalThemes.FIRST_ANSWER;

  useEffect(() => {
    // Entrada fluida
    translateY.value = withSpring(index * 110, { damping: 14, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 12 });

    // Salida automática
    const timeout = setTimeout(() => {
      closeToast();
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [index]);

  const closeToast = () => {
    translateY.value = withTiming(-150, { duration: 400, easing: Easing.in(Easing.ease) });
    opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(dismissAchievement)(achievement.id);
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY < 0) {
        translateY.value = (index * 110) + event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY < -40 || event.velocityY < -500) {
        runOnJS(closeToast)();
      } else {
        translateY.value = withSpring(index * 110, { damping: 14, stiffness: 100 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    position: 'absolute',
    top: 60, // Ajuste para status bar y separación
    width: width - 32,
    alignSelf: 'center',
    zIndex: 1000 - index, // Los más recientes se renderizan arriba
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.toastCard, animatedStyle, { shadowColor: theme.via }]}>
        <View style={styles.contentRow}>
          <View style={styles.medalContainer}>
            <AchievementMedal code={achievement.code} size="sm" />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.unlockedText, { color: theme.via }]}>LOGRO DESBLOQUEADO</Text>
            <Text style={styles.title} numberOfLines={1}>{achievement.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{achievement.description}</Text>
            
            <View style={[styles.xpBadge, { backgroundColor: theme.from + "20" }]}>
              <Text style={[styles.xpText, { color: theme.via }]}>+{achievement.experienceReward} XP</Text>
            </View>
          </View>

          <TouchableOpacity onPress={closeToast} style={styles.closeButton}>
            <X size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hostContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  toastCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 0.8)",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  medalContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    lineHeight: 16,
    marginBottom: 6,
  },
  xpBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 11,
    fontWeight: "900",
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
});
