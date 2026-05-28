import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

function getFirebaseApp() {
  const missingConfig = Object.entries(firebaseConfig)
    .filter(([key, value]) => key !== "measurementId" && !value)
    .map(([key]) => key);

  if (missingConfig.length > 0) {
    throw new Error(`Firebase web config is incomplete: ${missingConfig.join(", ")}`);
  }

  return getApps()[0] ?? initializeApp(firebaseConfig);
}

/**
 * Suscribirse a cambios del estado de autenticación de Firebase.
 * Firebase refresca el token automáticamente antes de que expire.
 * Retorna una función para desuscribirse (útil en useEffect cleanup).
 */
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getAuth(getFirebaseApp());
  return onAuthStateChanged(auth, callback);
}

/**
 * Autentica al Firebase Client SDK con email y contraseña.
 * Esto permite que onAuthStateChanged funcione y el token se refresque automáticamente.
 * El idToken resultante se puede usar para crear la sesión en el backend.
 */
export async function signInClientWithEmailPassword(email: string, password: string): Promise<string> {
  const auth = getAuth(getFirebaseApp());
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user.getIdToken();
}

export async function signInWithGoogle() {
  const auth = getAuth(getFirebaseApp());
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  const credential = await signInWithPopup(auth, provider);
  const idToken = await credential.user.getIdToken();

  return {
    idToken
  };
}
