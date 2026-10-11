 "use client";
import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, FileText, Trash2, Pencil, Send } from "lucide-react";
import type { Post } from "@/lib/types";
import { initials, timeAgo } from "@/lib/utils";

export function PostCard({ post, currentUserId, onChanged }: { post: Post; currentUserId: string; onChanged: () => void }) {
  const [liked,setLiked]=useState((post.likes||[]).some(x=>x.user_id===currentUserId));
  const [likeCount,setLikeCount]=useState(post.like_count ?? post.likes?.length ?? 0);
  const [commentsOpen,setCommentsOpen]=useState(false);
  const [comment,setComment]=useState("");
  const [comments,setComments]=useState(post.comments||[]);
  const [busy,setBusy]=useState(false);
  const [editing,setEditing]=useState(false);
  const [editContent,setEditContent]=useState(post.content);
  const [error,setError]=useState("");
  const mine=post.author_id===currentUserId;
  const profile=post.profiles;
  const name=profile?.full_name||"Campus student";

  async function toggleLike(){
    setError(""); const old=liked; setLiked(!old);setLikeCount(n=>n+(old?-1:1));
    try{const res=await fetch(`/api/posts/${post.id}/like`,{method:"POST"});const d=await res.json();if(!res.ok)throw new Error(d.error);setLiked(d.liked);setLikeCount(d.likeCount);}
    catch(e){setLiked(old);setLikeCount(n=>n+(old?1:-1));setError(e instanceof Error?e.message:"Could not update like.");}
  }
  async function deleteComment(commentId:string){
    try{const res=await fetch(`/api/posts/${post.id}/comments`,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({commentId})});const d=await res.json();if(!res.ok)throw new Error(d.error);setComments(c=>c.filter(x=>x.id!==commentId));}
    catch(e){setError(e instanceof Error?e.message:"Could not delete comment.");}
  }
  async function submitComment(e:React.FormEvent){
    e.preventDefault();if(!comment.trim())return;setBusy(true);setError("");
    try{const res=await fetch(`/api/posts/${post.id}/comments`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:comment.trim()})});const d=await res.json();if(!res.ok)throw new Error(d.error);setComments(c=>[...c,d.comment]);setComment("");}
    catch(e){setError(e instanceof Error?e.message:"Could not add comment.");}finally{setBusy(false);}
  }
  async function saveEdit(){
    setBusy(true);setError("");try{const res=await fetch(`/api/posts/${post.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:editContent})});const d=await res.json();if(!res.ok)throw new Error(d.error);setEditing(false);onChanged();}
    catch(e){setError(e instanceof Error?e.message:"Could not edit post.");}finally{setBusy(false);}
  }
  async function deletePost(){
    if(!window.confirm("Delete this post and its attached media?"))return;
    try{const res=await fetch(`/api/posts/${post.id}`,{method:"DELETE"});const d=await res.json();if(!res.ok)throw new Error(d.error);onChanged();}
    catch(e){setError(e instanceof Error?e.message:"Could not delete post.");}
  }
  return <article className="post-card">
    <div className="post-head"><div className="avatar">{profile?.avatar_url?<img src={profile.avatar_url} alt="" className="avatar"/>:initials(name)}</div><div style={{flex:1,minWidth:0}}><div className="post-author">{name}</div><div className="post-meta">{profile?.major||"Campus community"}{profile?.graduation_year?` · Class of ${profile.graduation_year}`:""} · {timeAgo(post.created_at)}</div></div>
      {mine&&<details style={{position:"relative"}}><summary aria-label="Post options" style={{listStyle:"none",cursor:"pointer",color:"#71817b"}}><MoreHorizontal size={20}/></summary><div style={{position:"absolute",right:0,top:25,zIndex:2,background:"#fff",border:"1px solid #e4ece8",borderRadius:10,padding:6,width:145,boxShadow:"0 8px 25px #1232"}}><button className="action-button" onClick={()=>{setEditing(true);}}><Pencil size={14}/> Edit</button><button className="action-button" onClick={deletePost}><Trash2 size={14}/> Delete</button></div></details>}
    </div>
    <span className="post-category">#{post.category}</span>
    {editing?<div style={{marginTop:12}}><textarea className="field" rows={4} value={editContent} onChange={e=>setEditContent(e.target.value)}/><div style={{display:"flex",gap:8,marginTop:8}}><button className="btn" onClick={saveEdit} disabled={busy}>Save changes</button><button className="btn secondary" onClick={()=>setEditing(false)}>Cancel</button></div></div>:<p className="post-content">{post.content}</p>}
    {(post.post_media||[]).map(m=><div key={m.id}>{m.file_type.startsWith("image/")?<img className="media-image" src={m.public_url||m.file_path} alt={m.original_name}/>:<a className="file-link" href={m.public_url||m.file_path} target="_blank" rel="noreferrer"><FileText size={19}/><span>{m.original_name}</span></a>}</div>)}
    {error&&<div className="notice error">{error}</div>}
    <div className="post-actions"><button className={`action-button ${liked?"liked":""}`} onClick={toggleLike}><Heart size={17} fill={liked?"currentColor":"none"}/>{likeCount} Likes</button><button className="action-button" onClick={()=>setCommentsOpen(x=>!x)}><MessageCircle size={17}/>{comments.length} Comments</button></div>
    {commentsOpen&&<div className="comment-list">{comments.map(c=><div className="comment" key={c.id}><div className="avatar" style={{width:30,height:30,fontSize:11}}>{initials(c.profiles?.full_name)}</div><div className="comment-text"><strong>{c.profiles?.full_name||"Student"}</strong><div>{c.content}</div><div className="post-meta">{timeAgo(c.created_at)}</div></div>{c.author_id===currentUserId&&<button className="action-button" title="Delete your comment" onClick={()=>deleteComment(c.id)}><Trash2 size={13}/></button>}</div>)}
      <form className="comment-form" onSubmit={submitComment}><input className="field" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a comment…" maxLength={2000}/><button className="btn" disabled={busy||!comment.trim()} aria-label="Send comment"><Send size={15}/></button></form>
    </div>}
  </article>;
}
