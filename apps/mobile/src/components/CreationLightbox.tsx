import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DraftingCompass, Newspaper, X } from 'lucide-react-native';
import { theme } from '../theme';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

interface CreationLightboxProps {
  visible: boolean;
  onClose: () => void;
  onSelectArchitect: () => void;
  onSelectFeed: () => void;
}

const { width } = Dimensions.get('window');
const CARD_SIZE = Math.min(width * 0.85, 340);

export function CreationLightbox({ visible, onClose, onSelectArchitect, onSelectFeed }: CreationLightboxProps) {
  const s = CARD_SIZE;
  
  // Triángulo superior-derecho (Arquitecto)
  const pathArchitect = `M0,0 L${s},0 L${s},${s} Z`;
  // Triángulo inferior-izquierdo (Feed)
  const pathFeed = `M0,0 L${s},${s} L0,${s} Z`;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {visible && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
          {/* Intense blur with a fallback background color */}
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
            <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
          </BlurView>
          
          <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut} style={{ alignItems: 'center' }}>
            <View style={[styles.cardContainer, { width: CARD_SIZE, height: CARD_SIZE }]}>
              <Svg width={CARD_SIZE} height={CARD_SIZE} viewBox={`0 0 ${CARD_SIZE} ${CARD_SIZE}`}>
                <Defs>
                  <LinearGradient id="archGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={theme.colors.brandBlue} />
                    <Stop offset="1" stopColor={theme.colors.brandNavy} />
                  </LinearGradient>
                </Defs>

                {/* Botón Feed (Abajo Izquierda) */}
                <Path 
                  d={pathFeed} 
                  fill="#ffffff" 
                  onPress={() => {
                    onClose();
                    setTimeout(onSelectFeed, 50);
                  }}
                />

                {/* Botón Arquitecto (Arriba Derecha) */}
                <Path 
                  d={pathArchitect} 
                  fill="url(#archGrad)" 
                  onPress={() => {
                    onClose();
                    setTimeout(onSelectArchitect, 50);
                  }}
                />
                
                {/* Línea divisoria en el centro */}
                <Path d={`M0,0 L${s},${s}`} stroke="#E2E8F0" strokeWidth={3} pointerEvents="none" />
              </Svg>

              {/* Contenido visual (íconos y textos) sobrepuesto */}
              <View style={[styles.overlays, { width: CARD_SIZE, height: CARD_SIZE }]} pointerEvents="none">
                
                {/* Overlay Feed (Yin) - Icono arriba, texto abajo */}
                <View style={[styles.contentSection, { bottom: CARD_SIZE * 0.10, left: CARD_SIZE * 0.10 }]}>
                  <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF', marginBottom: 12 }]}>
                    <Newspaper size={40} color={theme.colors.brandBlue} />
                  </View>
                  <Text style={[styles.title, { color: theme.colors.brandNavy }]}>Crear</Text>
                  <Text style={[styles.title, { color: theme.colors.brandNavy }]}>Publicación</Text>
                </View>

                {/* Overlay Arquitecto (Yang) - Texto arriba, icono abajo */}
                <View style={[styles.contentSection, { top: CARD_SIZE * 0.10, right: CARD_SIZE * 0.10, alignItems: 'flex-end' }]}>
                  <Text style={[styles.title, { color: '#ffffff', textAlign: 'right' }]}>Modo</Text>
                  <Text style={[styles.title, { color: '#ffffff', textAlign: 'right', marginBottom: 12 }]}>Arquitecto</Text>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 0 }]}>
                    <DraftingCompass size={40} color="#ffffff" />
                  </View>
                </View>
              </View>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
              <X size={20} color="#EF4444" />
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissArea: {
    flex: 1,
    width: '100%',
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  overlays: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentSection: {
    position: 'absolute',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  cancelButton: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2', // Light red background
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  }
});
