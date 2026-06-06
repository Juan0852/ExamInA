import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, User, Plus, FileText, Newspaper } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as NavigationBar from "expo-navigation-bar";
import { theme } from "../theme";
import { CreationLightbox } from "./CreationLightbox";

const BAR_HEIGHT = 61;
const NAV_GRADIENT_TOP    = "#FFFFFF";
const NAV_GRADIENT_MID    = "#FFFFFF";
const NAV_GRADIENT_BOTTOM = "#FFFFFF";
const BORDER_COLOR        = "rgba(191, 233, 255, 0.9)";
const FLOAT_BOTTOM_MARGIN = 16;
const PILL_RADIUS         = 24;
const FAB_ABOVE_BAR = 29;

/**
 * Componente SVG que dibuja el contorno completo de la barra (pill + notch)
 * usando únicamente coordenadas de path. Se superpone a la barra blanca.
 */
function BarOutline({ barWidth }: { barWidth: number }) {
  if (barWidth === 0) return null;

  const w = barWidth;
  const h = BAR_HEIGHT;
  const r = PILL_RADIUS;
  const notchW = 75;
  const ns = (w - notchW) / 2; // notch start x

  // Trazamos todo el contorno del pill + notch con coordenadas
  const d = [
    // Empezamos justo después de la esquina superior izquierda
    `M ${r} 0`,
    // Línea recta por el top hasta donde empieza el notch
    `H ${ns}`,
    // Curva del notch (mismas coordenadas Bézier que el SVG original, trasladadas)
    `c 4.1 0 7.4 3.1 7.9 7.1`,
    `C ${ns + 10} 21.7 ${ns + 22.5} 33 ${ns + 37.7} 33`,
    `c 15.2 0 27.7 -11.3 29.7 -25.9`,
    `c 0.5 -4 3.9 -7.1 7.9 -7.1`,
    // Línea recta por el top hasta la esquina superior derecha
    `H ${w - r}`,
    // Esquina superior derecha (arco)
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    // Lado derecho hacia abajo
    `V ${h - r}`,
    // Esquina inferior derecha (arco)
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    // Línea inferior de derecha a izquierda
    `H ${r}`,
    // Esquina inferior izquierda (arco)
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    // Lado izquierdo hacia arriba
    `V ${r}`,
    // Esquina superior izquierda (arco) — cierra el contorno
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `Z`,
  ].join(" ");

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: h,
      }}
      pointerEvents="none"
    >
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Path d={d} fill="none" stroke={BORDER_COLOR} strokeWidth={1.5} />
      </Svg>
    </View>
  );
}

type CustomTabBarProps = {
  state: {
    index: number;
    routes: Array<{ name: string }>;
  };
  navigation: {
    navigate: (name: string) => void;
  };
};

/** Fondo degradado que rellena su contenedor */
function NavGradientBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"    stopColor={NAV_GRADIENT_TOP} />
          <Stop offset="0.55" stopColor={NAV_GRADIENT_MID} />
          <Stop offset="1"    stopColor={NAV_GRADIENT_BOTTOM} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#navGrad)" />
    </Svg>
  );
}

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = (insets.bottom || 0) + FLOAT_BOTTOM_MARGIN;
  const [barWidth, setBarWidth] = useState(0);
  const [isLightboxVisible, setLightboxVisible] = useState(false);

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
      style={[styles.navigatorContainer, { bottom: bottomOffset }, animatedStyle]}
      pointerEvents="box-none"
    >
      {/* ── FAB — vive fuera del pill para no recortarse ── */}
      <View style={styles.fabLayer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setLightboxVisible(true)}
        >
          <Plus size={28} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── Pill bar ── */}
      <View
        style={styles.pillBar}
        pointerEvents="box-none"
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >

        {/* Lado Izquierdo */}
        <View style={styles.sideBlock}>
          <NavGradientBackground />
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
            onPress={() => navigation.navigate("examenes")}
          >
            <FileText
              size={22}
              color={active("examenes") ? theme.colors.brandBlue : "#94a3b8"}
              strokeWidth={active("examenes") ? 2.5 : 1.8}
            />
            <Text style={[styles.label, active("examenes") && styles.labelActive]}>
              Exámenes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Centro: muesca SVG */}
        <View style={styles.centerNotch} pointerEvents="none">
          <Svg width={75} height={61} viewBox="0 0 75 61" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="notchGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0"    stopColor={NAV_GRADIENT_TOP} />
                <Stop offset="0.55" stopColor={NAV_GRADIENT_MID} />
                <Stop offset="1"    stopColor={NAV_GRADIENT_BOTTOM} />
              </LinearGradient>
            </Defs>
            <Path
              d="M75.2 0v61H0V0c4.1 0 7.4 3.1 7.9 7.1C10 21.7 22.5 33 37.7 33c15.2 0 27.7-11.3 29.7-25.9.5-4 3.9-7.1 7.9-7.1h-.1z"
              fill="url(#notchGrad)"
            />
          </Svg>
        </View>

        {/* Lado Derecho */}
        <View style={styles.sideBlock}>
          <NavGradientBackground />
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("feed")}
          >
            <Newspaper
              size={22}
              color={active("feed") ? theme.colors.brandBlue : "#94a3b8"}
              strokeWidth={active("feed") ? 2.5 : 1.8}
            />
            <Text style={[styles.label, active("feed") && styles.labelActive]}>
              Feed
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

      {/* ── Outline SVG — contorno dibujado con coordenadas ── */}
      <BarOutline barWidth={barWidth} />

      {/* ── Lightbox Modal ── */}
      <CreationLightbox 
        visible={isLightboxVisible} 
        onClose={() => setLightboxVisible(false)} 
        onSelectArchitect={() => {
          const { router } = require("expo-router");
          router.push("/architect");
        }} 
        onSelectFeed={() => {
          const { router } = require("expo-router");
          router.push("/create-post");
        }} 
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  navigatorContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    height: FAB_ABOVE_BAR + BAR_HEIGHT,
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },

  fabLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.brandBlue,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },

  pillBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    borderRadius: PILL_RADIUS,
    overflow: "hidden",
    flexDirection: "row",
  },

  sideBlock: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  centerNotch: {
    width: 75,
    height: BAR_HEIGHT,
  },

  tabItem: {
    flex: 1,
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
});
