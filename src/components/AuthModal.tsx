import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Globe, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithCredential,
} from "firebase/auth";
import { toast } from "sonner";
import { useSystem } from "@/contexts/SystemContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional title override */
  title?: string;
  /** Optional subtitle override */
  subtitle?: string;
}

type AuthTab = "signin" | "signup";

const AuthModal = ({ isOpen, onClose, title, subtitle }: AuthModalProps) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { settings } = useSystem();

  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getFriendlyError = (code: string) => {
    const map: Record<string, string> = {
      "auth/email-already-in-use": isAr ? "البريد مستخدم بالفعل." : "Email already in use.",
      "auth/invalid-email": isAr ? "البريد الإلكتروني غير صالح." : "Invalid email address.",
      "auth/user-not-found": isAr ? "لا يوجد حساب بهذا البريد." : "No account found with this email.",
      "auth/wrong-password": isAr ? "كلمة المرور غير صحيحة." : "Incorrect password.",
      "auth/invalid-credential": isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.",
      "auth/weak-password": isAr ? "كلمة المرور ضعيفة جداً (6 أحرف على الأقل)." : "Password too weak (min 6 chars).",
      "auth/unauthorized-domain": isAr
        ? "هذا النطاق غير مصرح به في Firebase. أضف النطاق في إعدادات المصادقة."
        : "Domain not authorized in Firebase. Add it in Authentication settings.",
      "auth/popup-closed-by-user": isAr ? "تم إغلاق نافذة تسجيل الدخول." : "Sign-in popup was closed.",
      "auth/cancelled-popup-request": "",
    };
    return map[code] || (isAr ? `خطأ: ${code}` : `Error: ${code}`);
  };

  const loginWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.isNativePlatform()) {
        const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
        const googleUser = await GoogleAuth.signIn();
        const idToken =
          googleUser?.authentication?.idToken || (googleUser as any)?.idToken;
        if (!idToken) throw new Error("Missing ID Token");
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }
      toast.success(isAr ? "مرحباً بك! 👋" : "Welcome back! 👋");
      handleClose();
    } catch (err: any) {
      const msg = getFriendlyError(err?.code || "");
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError("");
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError(isAr ? "يرجى ملء جميع الحقول." : "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      if (tab === "signin") {
        await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        toast.success(isAr ? "مرحباً بعودتك!" : "Welcome back!");
      } else {
        if (!name.trim()) {
          setError(isAr ? "يرجى إدخال اسمك." : "Please enter your name.");
          setLoading(false);
          return;
        }
        if (!settings.registrationEnabled) {
          setError(isAr ? "التسجيل مغلق حالياً." : "Registration is currently disabled.");
          setLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        await updateProfile(result.user, { displayName: name.trim() });
        toast.success(isAr ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
      }
      handleClose();
    } catch (err: any) {
      setError(getFriendlyError(err?.code || ""));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300 opacity-100"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-sm bg-card rounded-[2.5rem] border border-border/20 shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 opacity-100 translate-y-0"
      >
        {/* Header */}
        <div className="relative bg-emerald-deep p-6 pb-8 text-center overflow-hidden">
          <div className="absolute inset-0 pattern-islamic opacity-10" />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors z-10"
          >
            <X size={14} />
          </button>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-3">
              <LogIn size={24} className="text-gold" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">
              {title || (isAr ? "تسجيل الدخول" : "Sign In")}
            </h2>
            {subtitle && (
              <p className="text-xs text-white/60 font-serif mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4 -mt-4">
          {/* Tabs */}
          <div className="flex bg-primary/5 rounded-2xl p-1 border border-primary/10">
            {(["signin", "signup"] as AuthTab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-serif transition-all ${
                  tab === t
                    ? "bg-card shadow text-primary"
                    : "text-primary/40 hover:text-primary/60"
                }`}
              >
                {t === "signin"
                  ? (isAr ? "دخول" : "Sign In")
                  : (isAr ? "إنشاء حساب" : "Register")}
                {!settings.registrationEnabled && t === "signup" && (
                  <Lock size={10} className="inline ml-1 opacity-50" />
                )}
              </button>
            ))}
          </div>

          {/* Google Button */}
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all flex items-center justify-center gap-2 font-serif font-bold text-sm text-primary active:scale-98"
          >
            <Globe size={16} className="text-blue-500" />
            {isAr ? "الدخول بجوجل" : "Continue with Google"}
          </button>

          {!settings.registrationEnabled && tab === "signup" && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-600">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-serif font-bold">
                {isAr 
                  ? "عذراً، باب التسجيل مغلق حالياً بقرار من الإدارة." 
                  : "Sorry, registration is currently closed by the administration."}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] text-primary/30 font-bold uppercase tracking-widest">
              {isAr ? "أو" : "or"}
            </span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Form */}
          <div className="space-y-3">
            {tab === "signup" && (
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? "الاسم" : "Full name"}
                  dir={isAr ? "rtl" : "ltr"}
                  className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 focus:border-accent outline-none font-serif text-sm text-primary placeholder:text-primary/30 transition-all"
                />
                <UserPlus size={14} className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-primary/30`} />
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                placeholder={isAr ? "البريد الإلكتروني" : "Email address"}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 focus:border-accent outline-none font-serif text-sm text-primary placeholder:text-primary/30 transition-all text-start"
              />
              <Mail size={14} className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-primary/30`} />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                placeholder={isAr ? "كلمة المرور" : "Password"}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 focus:border-accent outline-none font-serif text-sm text-primary placeholder:text-primary/30 transition-all text-start"
              />
              <Lock size={14} className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-primary/30`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary/60`}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 transition-all duration-300 opacity-100 translate-y-0"
            >
              <p className="text-xs font-serif text-red-500 leading-relaxed text-right flex-1">{error}</p>
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-emerald-deep text-gold font-serif font-bold text-sm shadow-lg shadow-emerald-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : tab === "signin" ? (
              <>
                {isAr ? "دخول" : "Sign In"}
                <LogIn size={16} />
              </>
            ) : (
              <>
                {isAr ? "إنشاء الحساب" : "Create Account"}
                <UserPlus size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
