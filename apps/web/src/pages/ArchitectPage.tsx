import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  DraftingCompass, 
  Eye, 
  EyeOff, 
  Lock, 
  Globe, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Check, 
  FileText, 
  Loader2, 
  ChevronLeft,
  Settings,
  HelpCircle
} from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { apiService } from "../shared/services/api.service";
import { useSubjectsViewModel } from "../viewmodels/useSubjectsViewModel";
import { useTopicsViewModel } from "../viewmodels/useTopicsViewModel";
import { MathText } from "../shared/components/MathText";

interface CustomQuestionInput {
  subjectId: string;
  topicId: string;
  statement: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  finalAnswer: string;
  explanation: string;
}

interface ExamQuestionItem {
  id: string; // client-side unique key
  type: "existing" | "custom";
  questionId?: string; // set if type === "existing"
  statement: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topicId: string;
  topicName: string;
  customQuestion?: CustomQuestionInput; // set if type === "custom"
}

export function ArchitectPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const { subjects, isLoading: isLoadingSubjects } = useSubjectsViewModel();

  // Mode state
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);

  // Stepper general info state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [allowCloning, setAllowCloning] = useState(true);

  // Questions state
  const [addedQuestions, setAddedQuestions] = useState<ExamQuestionItem[]>([]);

  // Search bank filters state
  const [searchTopicId, setSearchTopicId] = useState("");
  const [searchDifficulty, setSearchDifficulty] = useState<"" | "EASY" | "MEDIUM" | "HARD">("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Custom question state
  const [customTopicId, setCustomTopicId] = useState("");
  const [customStatement, setCustomStatement] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [customFinalAnswer, setCustomFinalAnswer] = useState("");
  const [customExplanation, setCustomExplanation] = useState("");
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);

  // AI Generator custom question state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load user's created exams
  const myExamsQuery = useQuery({
    queryKey: ["my-exams"],
    queryFn: () => apiService.get<{ data: any[] }>("/shared-exams/me"),
    enabled: !!token
  });

  // Load topics for selected subject (creation)
  const { topics, isLoading: isLoadingTopics } = useTopicsViewModel(selectedSubjectId || undefined);

  // Load existing database questions for selected subject
  const bankQuestionsQuery = useQuery({
    queryKey: ["bank-questions", selectedSubjectId, searchTopicId, searchDifficulty],
    queryFn: () => {
      let path = `/questions?subjectId=${selectedSubjectId}`;
      if (searchTopicId) path += `&topicId=${searchTopicId}`;
      if (searchDifficulty) path += `&difficulty=${searchDifficulty}`;
      return apiService.get<{ data: any[] }>(path);
    },
    enabled: isCreating && !!selectedSubjectId && isSearchModalOpen
  });

  const myExams = myExamsQuery.data?.data || [];
  const bankQuestions = bankQuestionsQuery.data?.data || [];

  // Toggle Visibility handler for dashboard
  const handleToggleVisibility = async (examId: string, currentVis: string) => {
    const nextVis = currentVis === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    try {
      await apiService.patch(`/shared-exams/${examId}/visibility`, { visibility: nextVis });
      await queryClient.invalidateQueries({ queryKey: ["my-exams"] });
    } catch (err) {
      console.error("Error updating exam visibility:", err);
    }
  };

  // Add existing question to builder
  const handleAddExistingQuestion = (question: any) => {
    // Check if already added
    if (addedQuestions.some((q) => q.questionId === question.id)) {
      alert("Esta pregunta ya ha sido añadida a tu examen.");
      return;
    }

    const newItem: ExamQuestionItem = {
      id: `existing-${question.id}-${Date.now()}`,
      type: "existing",
      questionId: question.id,
      statement: question.statement,
      difficulty: question.difficulty,
      topicId: question.topicId,
      topicName: question.topic?.name || "Tema general"
    };

    setAddedQuestions((prev) => [...prev, newItem]);
  };

  // Add custom question to builder
  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !customTopicId || !customStatement.trim() || !customFinalAnswer.trim()) {
      alert("Por favor completa los campos obligatorios de la pregunta.");
      return;
    }

    const selectedTopic = topics.find((t) => t.id === customTopicId);
    const topicName = selectedTopic ? selectedTopic.name : "Tema personalizado";

    const newItem: ExamQuestionItem = {
      id: `custom-${Date.now()}`,
      type: "custom",
      statement: customStatement.trim(),
      difficulty: customDifficulty,
      topicId: customTopicId,
      topicName,
      customQuestion: {
        subjectId: selectedSubjectId,
        topicId: customTopicId,
        statement: customStatement.trim(),
        difficulty: customDifficulty,
        finalAnswer: customFinalAnswer.trim(),
        explanation: customExplanation.trim()
      }
    };

    setAddedQuestions((prev) => [...prev, newItem]);
    
    // Reset custom form
    setCustomStatement("");
    setCustomFinalAnswer("");
    setCustomExplanation("");
    setIsCustomFormOpen(false);
  };

  // Complete the form using AI helper
  const handleCompleteWithAi = async () => {
    if (!customStatement.trim()) {
      alert("Por favor, escribe una descripción básica del problema en el enunciado para que la IA lo complete.");
      return;
    }
    if (!customTopicId) {
      alert("Por favor, selecciona un tema antes de completar con IA.");
      return;
    }

    setIsGeneratingAi(true);

    try {
      const response = await apiService.post<{
        data: {
          statement: string;
          difficulty: "EASY" | "MEDIUM" | "HARD";
          finalAnswer: string;
          explanation: string;
        };
      }>("/questions/generate-ai", {
        prompt: customStatement.trim(),
        subjectId: selectedSubjectId,
        topicId: customTopicId,
        difficulty: customDifficulty
      });

      if (response.data) {
        setCustomStatement(response.data.statement);
        setCustomDifficulty(response.data.difficulty);
        setCustomFinalAnswer(response.data.finalAnswer);
        setCustomExplanation(response.data.explanation);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al completar la pregunta con IA.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Close and reset custom form modal helper
  const closeCustomModal = () => {
    setIsCustomFormOpen(false);
    // Reset manual form
    setCustomStatement("");
    setCustomFinalAnswer("");
    setCustomExplanation("");
    setCustomDifficulty("MEDIUM");
    setCustomTopicId("");
  };


  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setAddedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Reordering
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...addedQuestions];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setAddedQuestions(list);
  };

  const handleMoveDown = (index: number) => {
    if (index === addedQuestions.length - 1) return;
    const list = [...addedQuestions];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setAddedQuestions(list);
  };

  // Save Exam
  const handleSaveExam = async () => {
    if (!title.trim()) {
      setSaveError("El título del examen es obligatorio.");
      return;
    }
    if (addedQuestions.length === 0) {
      setSaveError("Debes añadir al menos una pregunta al examen.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      visibility,
      allowCloning,
      questions: addedQuestions.map((q) => {
        if (q.type === "existing") {
          return { questionId: q.questionId };
        } else {
          return { customQuestion: q.customQuestion };
        }
      })
    };

    try {
      await apiService.post("/shared-exams", payload);
      await queryClient.invalidateQueries({ queryKey: ["my-exams"] });
      
      // Reset State & return
      handleResetBuilder();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar el examen.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetBuilder = () => {
    setIsCreating(false);
    setStep(1);
    setTitle("");
    setDescription("");
    setSelectedSubjectId("");
    setVisibility("PRIVATE");
    setAllowCloning(true);
    setAddedQuestions([]);
    setSaveError(null);
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E1B2F] p-6 rounded-3xl border border-slate-200/60 dark:border-brand-navy/30 transition-all duration-300">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-brand-cyan flex items-center gap-1.5 mb-1">
            <DraftingCompass size={12} className="animate-spin-slow" />
            Herramienta de Creador
          </span>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Modo Arquitecto
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Crea, estructura y publica tus propios simulacros de examen para la comunidad.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-bold py-3 px-5 rounded-2xl shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} />
            Crear Examen
          </button>
        )}
      </div>

      {/* DASHBOARD VIEW */}
      {!isCreating ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-brand-navy/20 pb-3">
            <h2 className="text-lg font-black text-slate-700 dark:text-slate-200">
              Mis Exámenes Creados ({myExams.length})
            </h2>
          </div>

          {myExamsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
              <span className="text-xs font-bold text-slate-400 mt-3">Cargando tus exámenes...</span>
            </div>
          ) : myExams.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#0E1B2F] rounded-3xl border border-dashed border-slate-200 dark:border-brand-navy/35">
              <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-750 mb-3" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-350">No tienes exámenes creados</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Crea tu primer examen e incorpora preguntas del banco o escribe tus propios enunciados con LaTeX.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-cyan hover:underline transition-all cursor-pointer"
              >
                Comenzar ahora <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myExams.map((exam: any) => {
                const isPublic = exam.visibility === "PUBLIC";
                return (
                  <div 
                    key={exam.id}
                    className="flex flex-col bg-white dark:bg-[#0E1B2F] rounded-3xl border border-slate-200/60 dark:border-brand-navy/35 p-5 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300 relative group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isPublic 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          {isPublic ? "Público" : "Privado"}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                          {exam.questionsCount || 0} preg.
                        </span>
                      </div>

                      {/* Visibility Toggle Button */}
                      <button
                        onClick={() => handleToggleVisibility(exam.id, exam.visibility)}
                        className="p-1.5 text-slate-400 hover:text-brand-blue dark:hover:text-brand-cyan rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
                        title={isPublic ? "Hacer privado" : "Publicar examen"}
                      >
                        {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mt-3 truncate">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-8 flex-1">
                      {exam.description || "Sin descripción."}
                    </p>

                    <div className="border-t border-slate-100 dark:border-brand-navy/15 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Creado el {new Date(exam.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* BUILDER CREATOR STEPPER FLOW */
        <div className="bg-white dark:bg-[#0E1B2F] rounded-3xl border border-slate-200/60 dark:border-brand-navy/30 p-6 md:p-8 transition-all">
          {/* Stepper Header */}
          <div className="flex items-center justify-center max-w-lg mx-auto mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-850 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-brand-blue -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {[
              { num: 1, label: "Info General" },
              { num: 2, label: "Preguntas" },
              { num: 3, label: "Confirmar" }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center flex-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > s.num 
                    ? "bg-brand-blue text-white" 
                    : step === s.num 
                    ? "bg-gradient-to-r from-brand-blue to-brand-cyan text-white shadow-md shadow-brand-blue/15" 
                    : "bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-650"
                }`}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider mt-1.5 ${
                  step === s.num ? "text-brand-blue dark:text-brand-cyan" : "text-slate-400 dark:text-slate-650"
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1: GENERAL INFO FORM */}
          {step === 1 && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-2 text-brand-blue dark:text-brand-cyan">
                <FileText size={18} />
                <h3 className="text-base font-black">Detalles de la evaluación</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Título del Examen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Simulacro de Análisis Matemático Selectividad"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue dark:focus:border-brand-cyan focus:bg-white dark:focus:bg-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Describe brevemente los contenidos y objetivos del simulacro..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue dark:focus:border-brand-cyan focus:bg-white dark:focus:bg-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Asignatura <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setAddedQuestions([]); // clear questions if subject changes
                    }}
                    className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-4 py-3 text-sm font-bold outline-none focus:border-brand-blue dark:focus:border-brand-cyan transition-all"
                  >
                    <option value="">Selecciona...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Visibilidad Inicial
                  </label>
                  <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-brand-navy/25">
                    <button
                      type="button"
                      onClick={() => setVisibility("PRIVATE")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        visibility === "PRIVATE"
                          ? "bg-white dark:bg-[#122543] text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-brand-navy/15"
                          : "text-slate-500 dark:text-slate-450 hover:text-slate-700"
                      }`}
                    >
                      <Lock size={12} />
                      Privado
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility("PUBLIC")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        visibility === "PUBLIC"
                          ? "bg-white dark:bg-[#122543] text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-brand-navy/15"
                          : "text-slate-500 dark:text-slate-450 hover:text-slate-700"
                      }`}
                    >
                      <Globe size={12} />
                      Público
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons Step 1 */}
              <div className="flex justify-between border-t border-slate-100 dark:border-brand-navy/15 pt-6 mt-8">
                <button
                  type="button"
                  onClick={handleResetBuilder}
                  className="px-5 py-3 rounded-2xl text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-slate-200/60 dark:border-brand-navy/25 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!title.trim() || !selectedSubjectId}
                  className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-brand-blue disabled:opacity-50 text-white text-xs font-bold hover:bg-brand-blue-hover transition-all cursor-pointer shadow-lg shadow-brand-blue/15"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: QUESTIONS BUILDER */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-brand-navy/15 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-700 dark:text-slate-200">
                    Preguntas añadidas ({addedQuestions.length})
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Arrastra o reordena las preguntas del examen y añade nuevas preguntas personalizadas o del banco.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTopicId("");
                      setSearchDifficulty("");
                      setIsSearchModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5 dark:text-brand-cyan dark:border-brand-cyan/20 dark:hover:bg-brand-cyan/5 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Search size={14} />
                    Añadir del Banco
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomFormOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-brand-navy/35 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    Pregunta Nueva
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {addedQuestions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200/80 dark:border-brand-navy/20">
                  <HelpCircle size={32} className="mx-auto text-slate-350 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tu examen aún no tiene preguntas</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Utiliza los botones de arriba para rellenar tu simulacro.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addedQuestions.map((q, idx) => (
                    <div 
                      key={q.id}
                      className="flex gap-4 bg-slate-50/40 dark:bg-[#07111F]/10 rounded-2xl border border-slate-200/50 dark:border-brand-navy/20 p-4 hover:border-slate-300 dark:hover:border-brand-navy/35 transition-all relative group"
                    >
                      {/* Controls Area */}
                      <div className="flex flex-col items-center gap-1.5 self-center">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <span className="text-[10px] font-black text-slate-400 select-none">
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === addedQuestions.length - 1}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-brand-blue dark:text-brand-cyan bg-brand-blue/5 px-2 py-0.5 rounded-md">
                            {q.topicName}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            q.difficulty === "EASY" 
                              ? "bg-green-50 dark:bg-green-950/15 text-green-600 dark:text-green-450"
                              : q.difficulty === "MEDIUM"
                              ? "bg-amber-50 dark:bg-amber-950/15 text-amber-600 dark:text-amber-450"
                              : "bg-red-50 dark:bg-red-950/15 text-red-600 dark:text-red-450"
                          }`}>
                            {q.difficulty === "EASY" ? "Fácil" : q.difficulty === "MEDIUM" ? "Medio" : "Difícil"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {q.type === "existing" ? "Banco" : "Propia"}
                          </span>
                        </div>
                        <MathText value={q.statement} className="text-sm font-semibold text-slate-700 dark:text-slate-350 line-clamp-3" />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 self-center transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons Step 2 */}
              <div className="flex justify-between border-t border-slate-100 dark:border-brand-navy/15 pt-6 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-5 py-3 rounded-2xl text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-slate-200/60 dark:border-brand-navy/25 text-xs font-bold transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={addedQuestions.length === 0}
                  className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-brand-blue disabled:opacity-50 text-white text-xs font-bold hover:bg-brand-blue-hover transition-all cursor-pointer shadow-lg shadow-brand-blue/15"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & REVIEW */}
          {step === 3 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-2 text-brand-blue dark:text-brand-cyan">
                <Sparkles size={18} />
                <h3 className="text-base font-black">Confirmación de examen</h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-brand-navy/20 p-5 space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Título</span>
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-250">{title}</h4>
                </div>

                {description && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Descripción</span>
                    <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5">{description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asignatura</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-350">
                      {subjects.find((s) => s.id === selectedSubjectId)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visibilidad</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-350">
                      {visibility === "PUBLIC" ? "Público" : "Privado"}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Preguntas</span>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-350">{addedQuestions.length} preguntas</p>
                </div>
              </div>

              {saveError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-200/50 dark:border-red-950/20">
                  {saveError}
                </div>
              )}

              {/* Action Buttons Step 3 */}
              <div className="flex justify-between border-t border-slate-100 dark:border-brand-navy/15 pt-6 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-5 py-3 rounded-2xl text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-slate-200/60 dark:border-brand-navy/25 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft size={14} /> Atrás
                </button>
                <button
                  type="button"
                  onClick={handleSaveExam}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-xs font-bold shadow-lg shadow-brand-blue/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Guardar y Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD FROM BANK */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/35 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-brand-navy/15 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                Seleccionar del Banco de Preguntas
              </h3>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {/* Filters Area */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-brand-navy/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Filtrar por Tema</label>
                <select
                  value={searchTopicId}
                  onChange={(e) => setSearchTopicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-brand-navy/40 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold outline-none"
                >
                  <option value="">Todos los temas</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Dificultad</label>
                <select
                  value={searchDifficulty}
                  onChange={(e) => setSearchDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-brand-navy/40 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold outline-none"
                >
                  <option value="">Todas las dificultades</option>
                  <option value="EASY">Fácil</option>
                  <option value="MEDIUM">Medio</option>
                  <option value="HARD">Difícil</option>
                </select>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {bankQuestionsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
                  <span className="text-xs font-bold text-slate-400 mt-2">Cargando banco de preguntas...</span>
                </div>
              ) : bankQuestions.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400 font-semibold">
                  No se encontraron preguntas que coincidan con los filtros.
                </p>
              ) : (
                bankQuestions.map((question: any) => {
                  const alreadyAdded = addedQuestions.some((q) => q.questionId === question.id);
                  return (
                    <div 
                      key={question.id}
                      className="flex items-start gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-brand-navy/15"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[8px] font-black uppercase text-brand-blue dark:text-brand-cyan bg-brand-blue/5 px-2 py-0.5 rounded-md">
                            {question.topic?.name || "Tema general"}
                          </span>
                          <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {question.difficulty === "EASY" ? "Fácil" : question.difficulty === "MEDIUM" ? "Medio" : "Difícil"}
                          </span>
                        </div>
                        <MathText value={question.statement} className="text-xs font-semibold text-slate-700 dark:text-slate-350 line-clamp-3" />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddExistingQuestion(question)}
                        disabled={alreadyAdded}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          alreadyAdded 
                            ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed" 
                            : "bg-brand-blue hover:bg-brand-blue-hover text-white shadow-sm shadow-brand-blue/15"
                        }`}
                      >
                        {alreadyAdded ? "Añadida" : "Añadir"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-brand-navy/15 bg-slate-50 dark:bg-slate-900/40 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-200 dark:border-brand-navy/35 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 2: WRITE CUSTOM QUESTION */}
      {isCustomFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/35 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-brand-navy/15 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                Crear Pregunta Personalizada
              </h3>
              <button
                type="button"
                onClick={closeCustomModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {/* Modal Scroll Content */}
            <form onSubmit={handleAddCustomQuestion} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Tema <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customTopicId}
                    onChange={(e) => setCustomTopicId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-blue"
                    required
                  >
                    <option value="">Selecciona...</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Dificultad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-blue"
                    required
                  >
                    <option value="EASY">Fácil</option>
                    <option value="MEDIUM">Medio</option>
                    <option value="HARD">Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Enunciado de la Pregunta <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Escribe el enunciado. Soporta LaTeX mediante delimitadores $$ ... $$ y \( ... \). Si vas a usar IA, escribe aquí tu prompt e indicaciones y haz clic en Completar con IA."
                  value={customStatement}
                  onChange={(e) => setCustomStatement(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
                {customStatement.trim() && (
                  <div className="mt-2 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-brand-navy/20 bg-slate-50/30 dark:bg-slate-900/5 text-xs text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                      <Eye size={10} />
                      Vista Previa Enunciado
                    </div>
                    <MathText value={customStatement} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Respuesta Final Correcta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. \(\frac{3}{2}\) o 4 (Completar con IA lo rellenará por ti)"
                    value={customFinalAnswer}
                    onChange={(e) => setCustomFinalAnswer(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue placeholder-slate-400 dark:placeholder-slate-550"
                    required
                  />
                  {customFinalAnswer.trim() && (
                    <div className="mt-2 p-2.5 rounded-2xl border border-dashed border-slate-200 dark:border-brand-navy/20 bg-slate-50/30 dark:bg-slate-900/5 text-xs font-black text-brand-blue dark:text-brand-cyan flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-1">
                        <Eye size={10} />
                        Vista Previa Respuesta:
                      </span>
                      <MathText value={customFinalAnswer} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Explicación / Procedimiento
                  </label>
                  <textarea
                    placeholder="Explica los pasos necesarios para llegar a la solución final (Completar con IA lo redactará por ti)..."
                    value={customExplanation}
                    onChange={(e) => setCustomExplanation(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  {customExplanation.trim() && (
                    <div className="mt-2 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-brand-navy/20 bg-slate-50/30 dark:bg-slate-900/5 text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                      <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                        <Eye size={10} />
                        Vista Previa Explicación
                      </div>
                      <MathText value={customExplanation} />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Form Footer */}
              <div className="flex justify-between items-center gap-2 border-t border-slate-100 dark:border-brand-navy/15 pt-4 mt-6">
                {/* Completar con IA button on the left */}
                <button
                  type="button"
                  onClick={handleCompleteWithAi}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 bg-gradient-to-r from-brand-blue to-purple-600 hover:from-brand-blue-hover hover:to-purple-700 text-white text-xs font-black rounded-xl shadow-md shadow-brand-blue/15 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Completando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Completar con IA
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeCustomModal}
                    className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-200 dark:border-brand-navy/35 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-md shadow-brand-blue/15 transition-all cursor-pointer"
                  >
                    Añadir Pregunta
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
