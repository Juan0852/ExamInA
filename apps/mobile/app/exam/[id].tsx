import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  AppState,
  AppStateStatus
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useExamSessionViewModel } from "../../src/viewmodels/useExamSessionViewModel";
import { theme } from "../../src/theme";
import { X, Check, ArrowLeft, Layers, Flame, Lightbulb, Edit3, Target, Camera, Image as ImageIcon, PenTool, AlertTriangle, Key, List, XCircle, Sparkles, Clock } from "lucide-react-native";
import { MathText } from "../../src/components/MathText";
import { WhiteboardModal } from "../../src/components/WhiteboardModal";
import { Image } from "expo-image";
import { apiService } from "../../src/services/api.service";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function ExamSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { examSession, isLoading, saveActivity, evaluateAnswer, finishExam, isEvaluating } = useExamSessionViewModel(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 0: Pregunta + Approach, 1: Solución IA
  const [currentFace, setCurrentFace] = useState<0 | 1>(0);
  const [approachText, setApproachText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isWhiteboardVisible, setIsWhiteboardVisible] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  // Heartbeat & Time Tracking
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerOpen, setIsTimerOpen] = useState(true);
  const elapsedSecondsRef = useRef(0);
  const activityBaseStartedAtRef = useRef(Date.now());
  const lastSyncedElapsedSecondsRef = useRef(0);
  const isExamClosed = Boolean(
    examSession &&
      (examSession.status === "COMPLETED" ||
        examSession.status === "ABANDONED" ||
        examSession.finishedAt)
  );

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!examSession?.startedAt) return;

    if (isExamClosed) {
      if (examSession.totalTimeSeconds > 0) {
        setElapsedSeconds(examSession.totalTimeSeconds);
      }
      return;
    }

    activityBaseStartedAtRef.current = Date.now();
    lastSyncedElapsedSecondsRef.current = examSession.totalTimeSeconds ?? 0;
    setElapsedSeconds(examSession.totalTimeSeconds ?? 0);

    const updateTimer = () => {
      const activeDiff = Math.floor((Date.now() - activityBaseStartedAtRef.current) / 1000);
      setElapsedSeconds((examSession.totalTimeSeconds ?? 0) + Math.max(0, activeDiff));
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [
    examSession?.startedAt,
    examSession?.status,
    examSession?.totalTimeSeconds,
    isExamClosed
  ]);

  const syncExamActivity = React.useCallback(async () => {
    if (!id || isExamClosed) return;
    const elapsed = elapsedSecondsRef.current;
    if (elapsed <= lastSyncedElapsedSecondsRef.current) return;

    try {
      await saveActivity(elapsed);
      lastSyncedElapsedSecondsRef.current = elapsed;
    } catch (err) {
      console.warn("No se pudo sincronizar el tiempo de estudio:", err);
    }
  }, [id, isExamClosed, saveActivity]);

  useEffect(() => {
    if (!id || isExamClosed) return;

    const intervalId = setInterval(() => {
      syncExamActivity();
    }, 15000);

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        syncExamActivity();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
      syncExamActivity();
    };
  }, [id, isExamClosed, syncExamActivity]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0")
    ].join(":");
  };

  const position = useRef(new Animated.ValueXY()).current;
  const faceAnim = useRef(new Animated.Value(0)).current;

  const animateToFace = (face: number) => {
    Keyboard.dismiss();
    Animated.timing(faceAnim, {
      toValue: face,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setCurrentFace(face as 0 | 1));
  };

  const handleVerify = async () => {
    const currentQuestion = examSession?.questions?.[currentIndex];
    if (!currentQuestion) return;

    try {
      setIsUploadingAttachments(true);
      const uploadedAttachmentIds: string[] = [];

      for (const uri of attachments) {
        try {
          const fetchRes = await fetch(uri);
          const blob = await fetchRes.blob();

          const fileName = uri.split('/').pop() || `upload-${Date.now()}.jpg`;
          const contentType = blob.type || "image/jpeg";

          const presignRes = await apiService.post<any>("/files/presign", {
            fileName,
            contentType,
            purpose: "ANSWER_ATTACHMENT",
            visibility: "PRIVATE"
          });

          const { uploadUrl, fileAssetId } = presignRes.data;

          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: blob,
            headers: {
              "Content-Type": contentType
            }
          });

          if (!uploadResponse.ok) {
            throw new Error(`S3 Upload Failed: ${uploadResponse.status}`);
          }

          await apiService.put("/files/confirm", { fileAssetId });
          uploadedAttachmentIds.push(fileAssetId);
        } catch (uploadError) {
          console.error("Error subiendo adjunto:", uploadError);
          alert("Hubo un problema subiendo una de las imágenes. Intentando continuar de todos modos.");
        }
      }

      setIsUploadingAttachments(false);

      const response = await evaluateAnswer({
        questionId: currentQuestion.questionId,
        userAnswer: approachText.trim() || "Adjuntos provistos",
        attachmentIds: uploadedAttachmentIds.length > 0 ? uploadedAttachmentIds : undefined
      });
      
      setEvaluations(prev => ({
        ...prev,
        [currentQuestion.id]: response.data.correction
      }));
      animateToFace(1);
    } catch (error) {
      setIsUploadingAttachments(false);
      console.error("Error al evaluar:", error);
      alert("Hubo un problema contactando a la IA.");
    }
  };

  const animateCardChange = (direction: "left" | "right", callback: () => void) => {
    const x = direction === "right" ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      callback();
      position.setValue({ x: direction === "right" ? -SCREEN_WIDTH * 1.2 : SCREEN_WIDTH * 1.2, y: 0 });
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 6,
        useNativeDriver: true,
      }).start();
    });
  };

  const onNextQuestion = () => {
    const questions = examSession?.questions || [];
    const currentQuestion = questions[currentIndex];
    
    if (currentQuestion) {
      // Intentional empty block: saveActivity is now handled automatically
    }

    if (currentIndex < questions.length - 1) {
      animateCardChange("right", () => {
        setCurrentIndex(prev => prev + 1);
        setCurrentFace(0);
        setApproachText("");
        setAttachments([]);
        faceAnim.setValue(0);
      });
    } else {
      finishExam(elapsedSecondsRef.current);
      router.back();
    }
  };

  const onPrevQuestion = () => {
    if (currentIndex > 0) {
      animateCardChange("left", () => {
        setCurrentIndex(prev => prev - 1);
        setCurrentFace(0);
        setApproachText("");
        setAttachments([]);
        faceAnim.setValue(0);
      });
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAttachments(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleTakePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesitan permisos de cámara para tomar fotos.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAttachments(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleWhiteboardSave = (uri: string) => {
    setAttachments(prev => [...prev, uri]);
  };

  if (isLoading || !examSession) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Flame size={48} color={theme.colors.brandBlue} style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Preparando tu examen...</Text>
      </SafeAreaView>
    );
  }

  const questions = examSession.questions || [];

  if (currentIndex >= questions.length) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.title}>¡Examen Terminado!</Text>
        <TouchableOpacity style={styles.finishButton} onPress={() => router.back()}>
          <Text style={styles.finishButtonText}>Ver Resultados</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentEvaluation = evaluations[currentQuestion.id];
  
  const hasInput = approachText.trim() !== "" || attachments.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Pregunta {currentIndex + 1} de {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((currentIndex) / questions.length) * 100}%` }]} />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.timerContainer}
            onPress={() => setIsTimerOpen(!isTimerOpen)}
          >
            <Clock size={16} color="#64748b" />
            {isTimerOpen && (
              <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <Animated.View style={[styles.card, { transform: [{ translateX: position.x }] }]}>
            {currentFace === 0 && (
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Layers size={14} color={theme.colors.brandBlue} />
                  <Text style={styles.badgeText}>{currentQuestion.type || "Desarrollo"}</Text>
                </View>
                <View style={styles.stepsIndicator}>
                  <View style={[styles.stepDot, styles.stepDotActive]} />
                  <View style={styles.stepLine} />
                  <View style={styles.stepDot} />
                </View>
              </View>
            )}

            {currentFace === 1 && currentEvaluation && (
              <View style={[styles.aiEvalHeader, { backgroundColor: currentEvaluation.score >= 7 ? "#10b981" : currentEvaluation.score >= 4 ? "#f59e0b" : "#ef4444" }]}>
                <View style={styles.aiEvalHeaderIcon}>
                  {currentEvaluation.score >= 7 ? <Check size={28} color="#ffffff" /> : <XCircle size={28} color="#ffffff" />}
                </View>
                <Text style={styles.aiEvalTitle}>EVALUACIÓN DE LA IA</Text>
                <Text style={styles.aiEvalSubtitle}>
                  {currentEvaluation.summary}
                </Text>
                <View style={styles.aiEvalScorePill}>
                  <Text style={styles.aiEvalScoreText}>Calificación: {currentEvaluation.score} / 10</Text>
                </View>
              </View>
            )}

            <ScrollView 
              style={[styles.cardScroll, currentFace === 1 && { paddingHorizontal: 0, paddingTop: 0 }]} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Cara 0: Pregunta y Approach */}
              {currentFace === 0 && (
                <View style={{ flex: 1 }}>
                  <View style={styles.faceSection}>
                    <View style={styles.faceHeader}>
                      <Target size={20} color="#0f172a" />
                      <Text style={styles.faceTitle}>Pregunta</Text>
                    </View>
                    <MathText text={currentQuestion.statement} fontSize={18} />
                  </View>

                  <View style={[styles.faceSection, { marginTop: 24 }]}>
                    <View style={styles.divider} />
                    <View style={styles.faceHeader}>
                      <Edit3 size={20} color={theme.colors.brandBlue} />
                      <Text style={[styles.faceTitle, { color: theme.colors.brandBlue }]}>Tu Desarrollo</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      multiline
                      placeholder="Escribe aquí tu planteamiento o respuesta detallada..."
                      placeholderTextColor="#94a3b8"
                      value={approachText}
                      onChangeText={setApproachText}
                      editable={currentFace === 0}
                    />
                    
                    <View style={styles.attachmentToolbar}>
                      <TouchableOpacity style={styles.toolbarButton} onPress={handleTakePicture}>
                        <Camera size={20} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.toolbarButton} onPress={handlePickImage}>
                        <ImageIcon size={20} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.toolbarButton} onPress={() => setIsWhiteboardVisible(true)}>
                        <PenTool size={20} color="#64748b" />
                        <Text style={styles.toolbarText}>Pizarra</Text>
                      </TouchableOpacity>
                    </View>

                    {attachments.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsContainer}>
                        {attachments.map((uri, idx) => (
                          <View key={idx} style={styles.attachmentThumb}>
                            <Image source={{ uri }} style={styles.attachmentImage} contentFit="cover" />
                            <TouchableOpacity 
                              style={styles.removeAttachment} 
                              onPress={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            >
                              <X size={12} color="#ffffff" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>
              )}

              {/* Cara 1: Solución de IA */}
              {currentFace === 1 && currentEvaluation && (
                <View style={styles.aiEvalBody}>
                  <Text style={styles.aiEvalSectionTitle}>RETROALIMENTACIÓN</Text>
                  <View style={{ marginBottom: 16 }}>
                    <MathText 
                      text={currentEvaluation.feedback} 
                      fontSize={15} 
                    />
                  </View>

                  {currentEvaluation.detectedErrors && currentEvaluation.detectedErrors.length > 0 && (
                    <>
                      <View style={styles.dividerLight} />
                      <View style={styles.aiEvalSectionHeader}>
                        <AlertTriangle size={16} color="#ef4444" />
                        <Text style={styles.aiEvalSectionTitle}>ERRORES DETECTADOS</Text>
                      </View>
                      {currentEvaluation.detectedErrors.map((err: string, i: number) => (
                        <View key={i} style={styles.bulletItem}>
                          <View style={[styles.bulletDot, { backgroundColor: "#ef4444" }]} />
                          <Text style={styles.bulletText}>{err}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {currentEvaluation.missingKeywords && currentEvaluation.missingKeywords.length > 0 && (
                    <>
                      <View style={styles.dividerLight} />
                      <View style={styles.aiEvalSectionHeader}>
                        <Key size={16} color="#d97706" />
                        <Text style={styles.aiEvalSectionTitle}>CONCEPTOS OMITIDOS</Text>
                      </View>
                      {currentEvaluation.missingKeywords.map((kw: string, i: number) => (
                        <View key={i} style={styles.conceptPill}>
                          <Text style={styles.conceptPillText}>{kw.toUpperCase()}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {currentEvaluation.suggestions && currentEvaluation.suggestions.length > 0 && (
                    <>
                      <View style={styles.dividerLight} />
                      <View style={styles.aiEvalSectionHeader}>
                        <List size={16} color={theme.colors.brandBlue} />
                        <Text style={styles.aiEvalSectionTitle}>RECOMENDACIONES DE MEJORA</Text>
                      </View>
                      {currentEvaluation.suggestions.map((rec: string, i: number) => (
                        <View key={i} style={styles.bulletItem}>
                          <View style={[styles.bulletDot, { backgroundColor: theme.colors.brandBlue }]} />
                          <Text style={styles.bulletText}>{rec}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Floating Control Buttons (Bottom of Card) */}
            <View style={styles.cardFooter}>
              {currentFace === 0 && (
                <TouchableOpacity 
                  style={[styles.primaryButton, (!hasInput || isEvaluating || isUploadingAttachments) && styles.disabledButton]} 
                  disabled={!hasInput || isEvaluating || isUploadingAttachments}
                  onPress={handleVerify}
                >
                  <Sparkles size={20} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>
                    {isUploadingAttachments ? "Subiendo imágenes..." : isEvaluating ? "La IA está evaluando..." : "Verificar con IA"}
                  </Text>
                </TouchableOpacity>
              )}

              {currentFace === 1 && (
                <View style={styles.navActionsRow}>
                  <TouchableOpacity 
                    style={[styles.navButtonSecondary, currentIndex === 0 && styles.disabledButton]} 
                    onPress={onPrevQuestion}
                    disabled={currentIndex === 0}
                  >
                    <Text style={styles.navButtonSecondaryText}>Anterior</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.navButtonPrimary} 
                    onPress={onNextQuestion}
                  >
                    <Text style={styles.navButtonPrimaryText}>
                      {currentIndex === questions.length - 1 ? "Terminar Examen" : "Siguiente pregunta"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
      <WhiteboardModal 
        visible={isWhiteboardVisible} 
        questionStatement={currentQuestion.statement}
        onClose={() => setIsWhiteboardVisible(false)}
        onSave={handleWhiteboardSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  attachmentToolbar: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  attachmentsContainer: {
    marginTop: 16,
    flexDirection: "row",
  },
  attachmentThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    position: "relative",
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },
  removeAttachment: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#f43f5e",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
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
    paddingHorizontal: 16,
    paddingBottom: 20, // Leave room for safe area
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  stamp: {
    position: "absolute",
    top: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 4,
    zIndex: 100,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  likeStamp: {
    left: 20,
    borderColor: "#10b981",
    transform: [{ rotate: "-10deg" }]
  },
  nopeStamp: {
    right: 20,
    borderColor: "#f43f5e",
    transform: [{ rotate: "10deg" }]
  },
  likeStampText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#10b981",
    letterSpacing: 2,
  },
  nopeStampText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#f43f5e",
    letterSpacing: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  aiEvalHeader: {
    backgroundColor: "#ef4444",
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
  },
  aiEvalHeaderIcon: {
    marginBottom: 12,
  },
  aiEvalTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  aiEvalSubtitle: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.9,
  },
  aiEvalScorePill: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiEvalScoreText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  aiEvalBody: {
    padding: 24,
  },
  aiEvalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  aiEvalSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 8,
  },
  dividerLight: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 16,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingRight: 16,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 14,
    color: "#0f172a",
    lineHeight: 20,
  },
  conceptPill: {
    backgroundColor: "#fef3c7",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  conceptPillText: {
    color: "#d97706",
    fontSize: 12,
    fontWeight: "800",
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
  stepsIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
  },
  stepDotActive: {
    backgroundColor: theme.colors.brandBlue,
  },
  stepLine: {
    width: 16,
    height: 2,
    backgroundColor: "#f1f5f9",
  },
  cardScroll: {
    flex: 1,
  },
  faceSection: {
    marginBottom: 10,
  },
  faceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  faceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: "#334155",
    textAlignVertical: "top",
  },
  solutionBox: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 16,
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
  },
  cardFooter: {
    paddingTop: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.brandBlue,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  navActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navButtonSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonSecondaryText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "800",
  },
  navButtonPrimary: {
    flex: 1.35,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.brandBlue,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  navButtonPrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  tinderActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    height: 80,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  nopeButton: { borderColor: "#ffe4e6" },
  likeButton: { borderColor: "#d1fae5" },
  actionTextNope: { fontSize: 13, fontWeight: "700", color: "#f43f5e" },
  actionTextLike: { fontSize: 13, fontWeight: "700", color: "#10b981" },
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
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  timerText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  }
});
