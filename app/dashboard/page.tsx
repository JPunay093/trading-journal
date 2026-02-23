"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          {user && (
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
