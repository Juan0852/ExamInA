import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  ScrollView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExamSessionViewModel } from "../../src/viewmodels/useExamSessionViewModel";
import { theme } from "../../src/theme";
import { X, Check, ArrowLeft, Layers, Flame } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function ExamSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { examSession, isLoading, saveActivity, finishExam } = useExamSessionViewModel(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction: "right" | "left") => {
    const x = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: "right" | "left") => {
    const score = direction === "right" ? 10 : 0;
    const questions = examSession?.questions || [];
    const currentQuestion = questions[currentIndex];

    if (currentQuestion) {
      // Guardar actividad (10 = Lo sabía, 0 = No lo sabía)
      saveActivity(currentQuestion.id, score);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      position.setValue({ x: 0, y: 0 });
    } else {
      finishExam();
      router.back();
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-30deg", "0deg", "30deg"],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  if (isLoading || !examSession) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Flame size={48} color={theme.colors.brandBlue} style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Preparando tus tarjetas...</Text>
      </SafeAreaView>
    );
  }

  const questions = examSession.questions || [];

  if (currentIndex >= questions.length) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.title}>¡Simulacro Terminado!</Text>
        <TouchableOpacity style={styles.finishButton} onPress={() => router.back()}>
          <Text style={styles.finishButtonText}>Volver al Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  // Simulamos una respuesta si el backend no trae (en este mockup)
  const mockAnswer = currentQuestion.solution?.finalAnswer || "La respuesta correcta depende del contexto de la pregunta, pero asegúrate de repasar los conceptos fundamentales de este tema.";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Tarjeta {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentIndex) / questions.length) * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card, getCardStyle()]}
        >
          {/* Sellos de Swipe */}
          <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeStampText}>A REPASAR</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.likeStampText}>LO SABÍA</Text>
          </Animated.View>

          <View style={styles.cardHeader}>
            <View style={styles.badge}>
              <Layers size={14} color={theme.colors.brandBlue} />
              <Text style={styles.badgeText}>{currentQuestion.type || "Pregunta"}</Text>
            </View>
          </View>

          <ScrollView style={styles.cardScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.statementText}>{currentQuestion.statement}</Text>
            
            {isFlipped ? (
              <View style={styles.answerSection}>
                <View style={styles.divider} />
                <Text style={styles.answerTitle}>Respuesta Ideal:</Text>
                <Text style={styles.answerText}>{mockAnswer}</Text>
              </View>
            ) : (
              <View style={styles.flipPrompt}>
                <Text style={styles.flipPromptText}>Toca "Voltear" para ver la respuesta</Text>
              </View>
            )}
          </ScrollView>

        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.nopeButton]} 
          onPress={() => forceSwipe("left")}
        >
          <X size={32} color="#f43f5e" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.flipButton} 
          onPress={() => setIsFlipped(!isFlipped)}
        >
          <Text style={styles.flipButtonText}>{isFlipped ? "Ocultar" : "Voltear Tarjeta"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]} 
          onPress={() => forceSwipe("right")}
        >
          <Check size={32} color="#10b981" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 6,
    textAlign: "center",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.brandBlue,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    height: "100%",
    maxHeight: SCREEN_HEIGHT * 0.65,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  stamp: {
    position: "absolute",
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 4,
    zIndex: 10,
    transform: [{ rotate: "-10deg" }]
  },
  likeStamp: {
    left: 20,
    borderColor: "#10b981",
  },
  nopeStamp: {
    right: 20,
    borderColor: "#f43f5e",
    transform: [{ rotate: "10deg" }]
  },
  likeStampText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#10b981",
    letterSpacing: 2,
  },
  nopeStampText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#f43f5e",
    letterSpacing: 2,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.brandBlue,
  },
  cardScroll: {
    flex: 1,
  },
  statementText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 24,
  },
  answerSection: {
    paddingBottom: 24,
  },
  answerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  answerText: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
  },
  flipPrompt: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  flipPromptText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 20,
    gap: 24,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nopeButton: {
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  likeButton: {
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  flipButton: {
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  flipButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 24,
  },
  finishButton: {
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  finishButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  }
});
