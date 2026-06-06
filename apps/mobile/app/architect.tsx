import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Send, Plus, Trash2 } from "lucide-react-native";
import { theme } from "../src/theme";
import { apiService } from "../src/services/api.service";

interface CustomQuestion {
  id: string;
  statement: string;
  finalAnswer: string;
}

export default function ArchitectScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  
  const [questions, setQuestions] = useState<CustomQuestion[]>([
    { id: Date.now().toString(), statement: "", finalAnswer: "" }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), statement: "", finalAnswer: "" }]);
  };

  const handleUpdateQuestion = (id: string, field: keyof CustomQuestion, value: string) => {
    setQuestions(q => q.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(q => q.filter(item => item.id !== id));
  };

  const isValid = title.trim() !== "" && questions.every(q => q.statement.trim() !== "" && q.finalAnswer.trim() !== "");

  const handlePublish = async () => {
    if (!isValid || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Mocked subjectId and topicId since we don't have a picker yet
      const payload = {
        title,
        description,
        visibility,
        allowCloning: true,
        subjectId: "b89d4d8c-2f9a-4f51-b06c-8db8a2b5e0c1", // Mocked, ideally from a picker
        topicId: "d6f51f4d-16f9-4672-88f5-93cf4d4a8e6e", // Mocked
        topicName: "Tema Libre",
        questions: questions.map(q => ({
          customQuestion: {
            subjectId: "b89d4d8c-2f9a-4f51-b06c-8db8a2b5e0c1",
            topicId: "d6f51f4d-16f9-4672-88f5-93cf4d4a8e6e",
            statement: q.statement,
            difficulty: "MEDIUM",
            finalAnswer: q.finalAnswer,
            explanation: "Explicación del arquitecto."
          }
        }))
      };

      await apiService.post("/shared-exams", payload);
      router.replace("/(tabs)/examenes");
    } catch (error) {
      console.error("Failed to create shared exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modo Arquitecto</Text>
          <TouchableOpacity 
            onPress={handlePublish} 
            style={[styles.publishButton, (!isValid || isSubmitting) && styles.publishButtonDisabled]}
            disabled={!isValid || isSubmitting}
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

        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles del Examen</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Ej. Simulacro Avanzado de Matemáticas"
              placeholderTextColor={theme.colors.textSoft}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Descripción breve..."
              placeholderTextColor={theme.colors.textSoft}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visibilidad</Text>
            <View style={styles.visibilityRow}>
              {['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'].map((vis) => (
                <TouchableOpacity 
                  key={vis}
                  style={[styles.visibilityBtn, visibility === vis && styles.visibilityBtnActive]}
                  onPress={() => setVisibility(vis)}
                >
                  <Text style={[styles.visibilityBtnText, visibility === vis && styles.visibilityBtnTextActive]}>
                    {vis === 'PUBLIC' ? 'Público' : vis === 'PRIVATE' ? 'Privado' : 'Amigos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preguntas</Text>
            {questions.map((q, index) => (
              <View key={q.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Pregunta {index + 1}</Text>
                  {questions.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveQuestion(q.id)}>
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Enunciado de la pregunta..."
                  placeholderTextColor={theme.colors.textSoft}
                  multiline
                  value={q.statement}
                  onChangeText={(text) => handleUpdateQuestion(q.id, "statement", text)}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Respuesta correcta"
                  placeholderTextColor={theme.colors.textSoft}
                  value={q.finalAnswer}
                  onChangeText={(text) => handleUpdateQuestion(q.id, "finalAnswer", text)}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addQuestionBtn} onPress={handleAddQuestion}>
              <Plus size={20} color={theme.colors.brandBlue} />
              <Text style={styles.addQuestionText}>Añadir Pregunta Manual</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.space4,
    paddingVertical: theme.spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  iconButton: {
    padding: theme.spacing.space2,
  },
  headerTitle: {
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
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: theme.spacing.space4,
    gap: theme.spacing.space6,
    paddingBottom: 100,
  },
  section: {
    gap: theme.spacing.space3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.brandNavy,
  },
  inputField: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    padding: theme.spacing.space3,
    fontSize: 15,
    color: theme.colors.text,
  },
  visibilityRow: {
    flexDirection: "row",
    gap: theme.spacing.space2,
  },
  visibilityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  visibilityBtnActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  visibilityBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
  visibilityBtnTextActive: {
    color: "#fff",
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.space4,
    borderRadius: 16,
    gap: theme.spacing.space3,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.brandNavy,
  },
  addQuestionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.space2,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.brandBlue,
    backgroundColor: "rgba(0,123,255,0.05)",
  },
  addQuestionText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.brandBlue,
  }
});
