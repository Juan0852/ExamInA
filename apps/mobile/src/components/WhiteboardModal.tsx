import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  PanResponder
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import ViewShot from 'react-native-view-shot';
import Svg, { Path } from 'react-native-svg';
import { X, Check, Trash2, Pencil, Eraser } from 'lucide-react-native';
import { MathText } from './MathText';
import { theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

interface WhiteboardModalProps {
  visible: boolean;
  questionStatement: string;
  onClose: () => void;
  onSave: (imageUri: string) => void;
}

import { SafeAreaView } from 'react-native-safe-area-context';

type PathData = { d: string; type: 'pen' | 'eraser' };

export function WhiteboardModal({ visible, questionStatement, onClose, onSave }: WhiteboardModalProps) {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  
  const [mode, setModeState] = useState<'pen' | 'eraser'>('pen');
  const modeRef = useRef<'pen' | 'eraser'>('pen');
  
  const setMode = (m: 'pen' | 'eraser') => {
    modeRef.current = m;
    setModeState(m);
  };
  
  const currentPathRef = useRef<string>('');
  const viewShotRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setPaths([]);
      setCurrentPath('');
      currentPathRef.current = '';
      setMode('pen');
    }
    
    return () => {
      if (visible) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
  }, [visible]);

  const handleTouchStart = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    currentPathRef.current = `M${locationX},${locationY}`;
    setCurrentPath(currentPathRef.current);
  };

  const handleTouchMove = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    currentPathRef.current += ` L${locationX},${locationY}`;
    setCurrentPath(currentPathRef.current);
  };

  const handleTouchEnd = () => {
    if (currentPathRef.current) {
      const newPathData: PathData = { d: currentPathRef.current, type: modeRef.current };
      setPaths((prev) => [...prev, newPathData]);
    }
    currentPathRef.current = '';
    setCurrentPath('');
  };

  const handleClear = () => {
    setPaths([]);
    currentPathRef.current = '';
    setCurrentPath('');
  };

  const handleSave = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        onSave(uri);
        onClose();
      }
    } catch (e) {
      console.error("Failed to capture whiteboard", e);
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      supportedOrientations={['landscape', 'portrait']}
      statusBarTranslucent={true}
      presentationStyle="fullScreen"
    >
      {visible && <StatusBar hidden={true} />}
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* Header Options */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <X size={24} color="#f43f5e" />
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            
            <View style={styles.toolsContainer}>
              <TouchableOpacity 
                onPress={() => setMode('pen')} 
                style={[styles.toolButton, mode === 'pen' && styles.toolButtonActive]}
              >
                <Pencil size={20} color={mode === 'pen' ? theme.colors.brandBlue : "#64748b"} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setMode('eraser')} 
                style={[styles.toolButton, mode === 'eraser' && styles.toolButtonActive]}
              >
                <Eraser size={20} color={mode === 'eraser' ? theme.colors.brandBlue : "#64748b"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
              <Trash2 size={20} color="#64748b" />
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Check size={20} color="#ffffff" />
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Split */}
        <View style={styles.splitContent}>
          {/* Left: Statement */}
          <View style={styles.leftPane}>
            <Text style={styles.paneTitle}>Enunciado</Text>
            <View style={styles.statementBox}>
              <MathText text={questionStatement} fontSize={16} />
            </View>
          </View>

          {/* Right: Canvas */}
          <View style={styles.rightPane}>
            <Text style={styles.paneTitle}>Pizarra de Desarrollo</Text>
            <ViewShot ref={viewShotRef} style={styles.canvasContainer} options={{ format: 'jpg', quality: 0.9 }}>
              <View 
                style={styles.canvasDrawArea} 
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={handleTouchStart}
                onResponderMove={handleTouchMove}
                onResponderRelease={handleTouchEnd}
                onResponderTerminate={handleTouchEnd}
              >
                <Svg width="100%" height="100%">
                  {paths.map((p, index) => (
                    <Path
                      key={index}
                      d={p.d}
                      stroke={p.type === 'eraser' ? '#ffffff' : theme.colors.brandBlue}
                      strokeWidth={p.type === 'eraser' ? 20 : 4}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {currentPath ? (
                    <Path
                      d={currentPath}
                      stroke={mode === 'eraser' ? '#ffffff' : theme.colors.brandBlue}
                      strokeWidth={mode === 'eraser' ? 20 : 4}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                </Svg>
              </View>
            </ViewShot>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelText: {
    color: '#f43f5e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  toolsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolButton: {
    padding: 8,
    borderRadius: 8,
  },
  toolButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  splitContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  leftPane: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rightPane: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  paneTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  statementBox: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  canvasDrawArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
