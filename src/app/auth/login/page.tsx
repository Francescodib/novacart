"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
   const router = useRouter();
   const searchParams = useSearchParams();

   // Get callbackUrl from query params, default to /dashboard
   const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
         const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
         });

         if (result?.error) {
            setError("Invalid credentials");
            setLoading(false);
         } else {
            // Login successful, redirect to callbackUrl
            router.push(callbackUrl);
         }
      } catch (err) {
         setError("Error during login");
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
         <div className="max-w-md w-full">
            <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 p-10">
               <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-xl mb-4">
                     <span className="text-white font-bold text-2xl">N</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">NovaCart</h1>
                  <p className="text-neutral-400">Log in to your account</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                     <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                        Email
                     </label>
                     <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        placeholder="test@novacart.com"
                     />
                  </div>

                  <div>
                     <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                        Password
                     </label>
                     <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        placeholder="••••••••"
                     />
                  </div>

                  {error && (
                     <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
                        {error}
                     </div>
                  )}

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition"
                  >
                     {loading ? "Logging in..." : "Log In"}
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-neutral-800">
                  <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4">
                     <p className="text-sm text-emerald-400 font-medium mb-2">
                        Test credentials
                     </p>
                     <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                        Email: test@novacart.com<br />
                        Password: password123
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
