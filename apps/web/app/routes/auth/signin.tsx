import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { signin, getMe } from "../../../services/auth.service";
import { LogIn, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export function meta() {
  return [
    { title: "Sign In - OpenRouter" },
    { name: "description", content: "Sign in to your OpenRouter account" },
  ];
}

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if already logged in
  const { data: meData, isSuccess: isAlreadyLoggedIn } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  useEffect(() => {
    if (isAlreadyLoggedIn && meData?.user) {
      navigate("/user/dashboard", { replace: true });
    }
  }, [isAlreadyLoggedIn, meData, navigate]);

  const mutation = useMutation({
    mutationFn: signin,
    onSuccess: () => {
      // Invalidate 'me' query to fetch updated user state
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/user/dashboard", { replace: true });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Something went wrong. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    mutation.mutate({ email, password });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute bottom-0 right-10 -z-10 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-[120px]" />

      <div className="w-full max-w-md px-6">
        {/* Logo/Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access your OpenRouter account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
              </div>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-indigo-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 cursor-pointer"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-zinc-800 pt-6 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
