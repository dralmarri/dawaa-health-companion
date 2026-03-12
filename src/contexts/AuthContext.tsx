import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logOut, resetPassword, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use": return "البريد الإلكتروني مستخدم بالفعل";
    case "auth/invalid-email": return "البريد الإلكتروني غير صحيح";
    case "auth/weak-password": return "كلمة المرور ضعيفة جداً (6 أحرف على الأقل)";
    case "auth/user-not-found": return "لا يوجد حساب بهذا البريد الإلكتروني";
    case "auth/wrong-password": return "كلمة المرور غير صحيحة";
    case "auth/invalid-credential": return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    case "auth/too-many-requests": return "تم تجاوز عدد المحاولات، حاول لاحقاً";
    default: return "حدث خطأ، حاول مرة أخرى";
  }
}
