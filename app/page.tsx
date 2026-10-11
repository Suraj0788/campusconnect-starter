import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Feed } from "@/components/feed";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) return <div className="auth-wrap"><section className="auth-art"><div className="brand"><span className="brand-mark">🎓</span><span>Campus<span>Connect</span></span></div><h1>Your campus.<br/>Your community.</h1><p>Share updates, ask questions, find project teammates, and never miss what's happening around you.</p><div style={{marginTop:30,fontWeight:700,color:"#087f5b"}}>Connect · Share · Grow</div></section><section className="auth-form"><div className="auth-box"><div className="brand"><span className="brand-mark">🎓</span><span>Campus<span>Connect</span></span></div><h2>Welcome to your campus</h2><p>Sign in to connect with your student community.</p><Link className="btn" style={{width:"100%",marginTop:18}} href="/sign-in">Sign in</Link><Link className="btn secondary" style={{width:"100%",marginTop:10}} href="/sign-up">Create account</Link><p style={{fontSize:12,marginTop:25}}>By continuing, you agree to be respectful and keep the community useful for everyone.</p></div></section></div>;
  const user = await currentUser();
  const supabase = await createServerSupabaseClient();
  const {data:profile}=await supabase.from("profiles").select("user_id").eq("user_id",userId).maybeSingle();
  if(!profile) redirect("/profile/edit?welcome=1");
  return <Shell active="Home"><div className="welcome-card"><div><h2>Good to have you here 👋</h2><p>What’s happening on your campus today? Share it with your community.</p></div><div className="welcome-emoji">🌿</div></div><Feed currentUserId={userId} userName={user?.firstName||"Student"}/></Shell>;
}
