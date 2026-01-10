import React, { useEffect, useState } from "react";
import SoftBackdrop from "./SoftBackdrop";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, Mail, Lock, User as UserIcon, LogIn } from "lucide-react";

type AuthState = "login" | "signup";

const Login = () => {
  const [state, setState] = useState<AuthState>("login");
  const [loading, setLoading] = useState(false);
  const { user, login, signUp } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "login") {
        await login(formData);
        toast.success("Welcome back!");
      } else {
        await signUp(formData);
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Redirect after successful auth
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SoftBackdrop />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-8 shadow-2xl overflow-hidden"
      >
        <div className="mt-10 mb-8">
          <h1 className="text-white text-3xl font-semibold tracking-tight">
            {state === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {state === "login"
              ? "Please sign in to continue your journey"
              : "Sign up to start generating amazing thumbnails"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Name field only for signup */}
          {state === "signup" && (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 h-12 rounded-2xl pl-12 pr-4 text-white placeholder-zinc-500 outline-none transition-all"
                value={formData.name}
                onChange={handleChange}
                required={state === "signup"}
              />
            </div>
          )}

          {/* Email */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 h-12 rounded-2xl pl-12 pr-4 text-white placeholder-zinc-500 outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 h-12 rounded-2xl pl-12 pr-4 text-white placeholder-zinc-500 outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Forgot password - only show on login */}
        {state === "login" && (
          <div className="mt-3 text-right">
            <button
              type="button"
              className="text-xs text-zinc-400 hover:text-pink-400 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full h-12 rounded-2xl text-white bg-pink-600 hover:bg-pink-500 active:scale-[0.98] transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              {state === "login" ? <LogIn size={20} /> : null}
              <span>{state === "login" ? "Login" : "Create Account"}</span>
            </>
          )}
        </button>

        {/* Toggle login/signup */}
        <div className="mt-6 mb-10">
          <p className="text-zinc-400 text-sm">
            {state === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setState((prev) => (prev === "login" ? "signup" : "login"));
                setFormData({ name: "", email: "", password: "" }); // Reset form on switch
              }}
              className="text-pink-400 hover:text-pink-300 font-medium ml-2 transition-colors underline-offset-4 hover:underline"
            >
              {state === "login" ? "Sign up now" : "Login here"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
