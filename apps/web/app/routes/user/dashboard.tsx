import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getMe, signout } from "../../../services/auth.service";
import { Loader2, LogOut, Wallet, User as UserIcon, Coins } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      navigate("/auth/signin", { replace: true });
    },
  });

  // Redirect if unauthorized
  useEffect(() => {
    if (isError) {
      navigate("/auth/signin", { replace: true });
    }
  }, [isError, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const user = data?.user;

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 antialiased">
      {/* Glow effects */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
      <div className="absolute bottom-10 left-10 -z-10 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-[120px]" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
            <span className="text-xl font-bold tracking-tight text-white">
              OpenRouter
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 py-1.5 px-3 text-sm text-zinc-300">
              <Coins className="h-4 w-4 text-amber-500" />
              <span>{user.credits} Credits</span>
            </div>

            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 py-1.5 px-3 text-sm font-semibold text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl py-12 px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">User Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Manage your profile, API keys, and model usage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900/60 text-zinc-400 border border-zinc-800">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <p className="text-sm text-zinc-450">{user.email}</p>
              </div>
            </div>
            <div className="mt-6 border-t border-zinc-800/80 pt-4 text-xs text-zinc-550">
              User Account ID: {user.id}
            </div>
          </div>

          {/* Credits Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900/60 text-amber-500/80 border border-zinc-800">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Available Credits
                </h3>
                <p className="text-2xl font-extrabold text-white mt-1">
                  {user.credits}
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-zinc-800/80 pt-4 text-xs text-zinc-550">
              Refill credits in billing settings
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
