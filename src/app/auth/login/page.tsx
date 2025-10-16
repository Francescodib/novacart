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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
         <div className="max-w-md w-full">
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
               <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">NovaCart</h1>
                  <p className="text-gray-400">Log in to your account</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                     </label>
                     <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="test@novacart.com"
                     />
                  </div>

                  <div>
                     <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                     </label>
                     <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                     />
                  </div>

                  {error && (
                     <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                     </div>
                  )}

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition"
                  >
                     {loading ? "Logging in..." : "Log In"}
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                     <p className="text-sm text-blue-300 font-semibold mb-2">
                        🧪 Test credentials:
                     </p>
                     <p className="text-xs text-gray-300 font-mono">
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
