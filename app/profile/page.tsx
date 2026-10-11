import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, GraduationCap, BookOpen, CalendarDays } from "lucide-react";
import { Shell } from "@/components/shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
export default async function ProfilePage() {
  const {userId}=await auth();if(!userId)redirect("/sign-in");
  const db=await createServerSupabaseClient();
  const {data:p,error}=await db.from("profiles").select("*").eq("user_id",userId).maybeSingle();
  if(error) return <Shell active="Profile"><div className="notice error">Could not load your profile. Apply the database schema and verify your Supabase configuration.</div></Shell>;
  if(!p)redirect("/profile/edit?welcome=1");
  const {count:postCount}=await db.from("posts").select("*",{count:"exact",head:true}).eq("author_id",userId);
  return <Shell active="Profile"><div className="profile-card"><div className="profile-cover"/><div className="profile-info"><div style={{display:"flex",alignItems:"end",justifyContent:"space-between",gap:10}}><div className="profile-avatar">{p.avatar_url?<img src={p.avatar_url} alt="" className="profile-avatar" style={{margin:0,border:0}}/>:initials(p.full_name)}</div><Link className="btn secondary" href="/profile/edit"><Pencil size={15}/> Edit profile</Link></div><h1 className="page-title" style={{marginTop:14}}>{p.full_name||"Campus student"}</h1><p style={{color:"#71817b",margin:"5px 0 12px"}}>@{userId.slice(0,10)}</p><p style={{lineHeight:1.7,fontSize:14}}>{p.bio||"Add a bio to tell your campus community a little about yourself."}</p><div style={{display:"flex",gap:15,flexWrap:"wrap",fontSize:13,color:"#71817b",marginTop:16}}><span><GraduationCap size={15} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>{p.major||"Major not set"}</span><span><CalendarDays size={15} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>{p.graduation_year||"Graduation year not set"}</span><span><BookOpen size={15} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>Student</span></div></div></div><div className="profile-grid"><div className="panel"><strong>{postCount||0}</strong><span>Posts</span></div><div className="panel"><strong>{p.graduation_year||"—"}</strong><span>Graduation year</span></div><div className="panel"><strong>{p.major?"✓":"—"}</strong><span>Major added</span></div></div><div style={{marginTop:26}}><h2 className="page-title" style={{fontSize:21}}>Your post history</h2><p className="subheading">Your recent contributions to the campus community.</p><ProfilePosts userId={userId}/></div></Shell>;
}
async function ProfilePosts({userId}:{userId:string}) {
 const db=await createServerSupabaseClient();
 const {data}=await db.from("posts").select("*,profiles(user_id,full_name,bio,major,graduation_year,avatar_url),post_media(*)").eq("author_id",userId).order("created_at",{ascending:false}).limit(20);
 if(!data?.length)return <div className="empty-state"><h3>No posts yet</h3><p>Your posts will appear here.</p><Link className="btn" href="/?compose=1">Create your first post</Link></div>;
 return <div>{data.map(p=><article className="post-card" key={p.id}><span className="post-category">#{p.category}</span><p className="post-content">{p.content}</p><div className="post-meta">{new Date(p.created_at).toLocaleString()}</div></article>)}</div>;
}
