 "use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import type { Post } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { PostComposer } from "@/components/post-composer";
import { PostCard } from "@/components/post-card";

export function Feed({ currentUserId, userName, searchMode=false, initialCategory="" }: { currentUserId:string;userName:string;searchMode?:boolean;initialCategory?:string }) {
  const [posts,setPosts]=useState<Post[]>([]);
  const [category,setCategory]=useState(initialCategory);
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [showComposer,setShowComposer]=useState(false);
  const refresh=useCallback(async()=>{
    setLoading(true);setError("");
    try{const params=new URLSearchParams();if(category)params.set("category",category);if(query.trim())params.set("q",query.trim());const res=await fetch(`/api/posts?${params.toString()}`);const d=await res.json();if(!res.ok)throw new Error(d.error);setPosts(d.posts||[]);}
    catch(e){setError(e instanceof Error?e.message:"Could not load posts.");}
    finally{setLoading(false);}
  },[category,query]);
  useEffect(()=>{const timer=setTimeout(()=>{void refresh();},250);return()=>clearTimeout(timer);},[refresh]);
  return <div>
    <div style={{display:"flex",alignItems:"end",justifyContent:"space-between",gap:10,marginBottom:17}}><div><h1 className="page-title">{searchMode?"Explore campus":"Campus feed"}</h1><p className="subheading" style={{marginBottom:0}}>{searchMode?"Find posts, people, events, and ideas.":`Welcome back, ${userName}. Here’s what’s happening.`}</p></div>{searchMode&&<Sparkles size={23} color="#087f5b"/>}</div>
    {searchMode&&<div className="search-row"><div style={{position:"relative",flex:1}}><Search size={17} style={{position:"absolute",left:12,top:13,color:"#87948e"}}/><input className="search-input" style={{paddingLeft:38}} placeholder="Search posts or authors…" value={query} onChange={e=>setQuery(e.target.value)}/></div></div>}
    {!searchMode&&<><button className="btn secondary" style={{width:"100%",justifyContent:"flex-start",marginBottom:14}} onClick={()=>setShowComposer(x=>!x)}><span className="avatar" style={{width:28,height:28,fontSize:10}}>You</span> Share something with your campus…</button>{showComposer&&<PostComposer onCreated={()=>{setShowComposer(false);void refresh();}}/>}</>}
    <div className="filters"><button className={`chip ${!category?"active":""}`} onClick={()=>setCategory("")}><SlidersHorizontal size={12} style={{display:"inline",marginRight:4}}/>All posts</button>{CATEGORIES.map(c=><button key={c} className={`chip ${category===c?"active":""}`} onClick={()=>setCategory(category===c?"":c)}>#{c}</button>)}</div>
    {error&&<div className="notice error">{error}<p style={{margin:"6px 0 0"}}>Check that your Supabase project is configured and the SQL setup has been applied.</p></div>}
    {loading?<div className="empty-state"><p>Loading campus posts…</p></div>:posts.length===0?<div className="empty-state"><Sparkles size={28} color="#087f5b"/><h3>No posts found yet</h3><p>{query||category?"Try another search or category.":"Be the first to share something with your campus."}</p>{searchMode&&<Link className="btn secondary" href="/">Back to feed</Link>}</div>:posts.map(post=><PostCard key={post.id} post={post} currentUserId={currentUserId} onChanged={()=>void refresh()}/>)}
  </div>;
}
