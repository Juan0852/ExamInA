import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, User, Plus, BookOpen, FileText } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as NavigationBar from "expo-navigation-bar";
import { theme } from "../theme";

const { width } = Dimensions.get("window");
const BAR_HEIGHT = 61; // Definido por las dimensiones del SVG

type CustomTabBarProps = {
  state: {
    index: number;
    routes: Array<{ name: string }>;
  };
  navigation: {
    navigate: (name: string) => void;
  };
};

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom || 12;

  // ── Animación para el modo inmersivo en Android ──
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = NavigationBar.addVisibilityListener(({ visibility }) => {
      translateY.value = withTiming(visibility === "visible" ? -48 : 0, {
        duration: visibility === "visible" ? 280 : 220,
        easing: visibility === "visible"
          ? Easing.out(Easing.cubic)
          : Easing.in(Easing.cubic),
      });
    });
    return () => sub.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const active = (name: string) => state.routes[state.index]?.name === name;

  return (
    <Animated.View
      style={[
        styles.navigatorContainer,
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.barRow, { height: BAR_HEIGHT }]} pointerEvents="box-none">
        {/* Lado Izquierdo */}
        <View style={styles.sideBlock}>
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("dashboard")}
          >
            <Home
              size={22}
              color={active("dashboard") ? theme.colors.brandBlue : "#94a3b8"}
              strokeWidth={active("dashboard") ? 2.5 : 1.8}
            />
            <Text style={[styles.label, active("dashboard") && styles.labelActive]}>
              Inicio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("temario")}
          >
            <BookOpen
              size={22}
              color={active("temario") ? theme.colors.brandBlue : "#94a3b8"}
              strokeWidth={active("temario") ? 2.5 : 1.8}
            />
            <Text style={[styles.label, active("temario") && styles.labelActive]}>
              Temario
            </Text>
          </TouchableOpacity>
        </View>

        {/* Centro: SVG Recortado y FAB */}
        <View style={styles.centerButtonContainer} pointerEvents="box-none">
          <Svg width={75} height={61} viewBox="0 0 75 61" style={styles.svgBackground}>
            <Path
              d="M75.2 0v61H0V0c4.1 0 7.4 3.1 7.9 7.1C10 21.7 22.5 33 37.7 33c15.2 0 27.7-11.3 29.7-25.9.5-4 3.9-7.1 7.9-7.1h-.1z"
              fill="#FFFFFF"
            />
          </Svg>
          
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.85}
            onPress={() => {
              Alert.alert(
                "¿Qué deseas crear?",
                "Elige una opción",
                [
                  { text: "Cancelar", style: "cancel" },
                  { 
                    text: "Nuevo Examen", 
                    onPress: () => navigation.navigate("temario") 
                  },
                  { 
                    text: "Nueva Publicación", 
                    onPress: () => console.log("Próximamente: Feed activo") 
                  }
                ]
              );
            }}
          >
            <Plus size={28} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Lado Derecho */}
        <View style={styles.sideBlock}>
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("exams")}
          >
            <FileText
              size={22}
              color={active("exams") ? theme.colors.brandBlue : "#94a3b8"}
              strokeWidth={active("exams") ? 2.5 : 1.8}
            />
            <Text style={[styles.label, active("exams") && styles.labelActive]}>
              Exámenes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("profile")}
          >
            <User
              size={22}
              color={active("profile") ? theme.colors.brandBlue : "#94a3b8"}
              strokeWidth={active("profile") ? 2.5 : 1.8}
            />
            <Text style={[styles.label, active("profile") && styles.labelActive]}>
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Relleno blanco para el padding inferior (safe area) */}
      <View style={[styles.safeAreaFill, { height: bottomPad }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  navigatorContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 16, // Elevación para asegurar que siempre está por encima del dashboard
  },
  barRow: {
    flexDirection: "row",
    width: "100%",
  },
  sideBlock: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  safeAreaFill: {
    backgroundColor: "#ffffff",
    width: "100%",
  },
  tabItem: {
    flex: 1, // Permite que los 2 botones se repartan el ancho del bloque 50/50
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    height: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  labelActive: {
    color: theme.colors.brandBlue,
    fontWeight: "900",
  },
  centerButtonContainer: {
    position: "relative",
    width: 75,
    alignItems: "center",
  },
  svgBackground: {
    position: "absolute",
    top: 0,
  },
  fab: {
    top: -32, // Desplaza el botón más hacia arriba para mejor separación
    justifyContent: "center",
    alignItems: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.brandBlue,
    // Efecto Neón
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 0 }, // Sombra centrada
    shadowOpacity: 0.8, // Más opacidad
    shadowRadius: 16, // Más difuminado = más "glow"
    elevation: 12, // Elevación en Android (toma el shadowColor en Android >= 28)
  },
});
