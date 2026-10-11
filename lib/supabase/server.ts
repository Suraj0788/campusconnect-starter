import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing. Copy .env.example to .env.local and configure them.");

  const { getToken } = await auth();
  return createClient(url, key, {
    accessToken: async () => {
      const template = process.env.CLERK_SUPABASE_JWT_TEMPLATE || "supabase";
      return (await getToken({ template })) ?? "";
    },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
