 "use client";
import { FormEvent, useRef, useState } from "react";
import { ImagePlus, FileText, Send } from "lucide-react";
import { CATEGORIES } from "@/lib/types";

export function PostComposer({ onCreated }: { onCreated: () => void }) {
  const [content,setContent]=useState("");
  const [category,setCategory]=useState<string>("Announcements");
  const [files,setFiles]=useState<File[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const inputRef=useRef<HTMLInputElement>(null);

  async function submit(e:FormEvent) {
    e.preventDefault(); setError("");
    if(!content.trim()){setError("Write something before posting.");return;}
    if(files.some(f=>f.size>10*1024*1024)){setError("Each file must be 10 MB or smaller.");return;}
    setBusy(true);
    try {
      const form=new FormData(); form.set("content",content.trim()); form.set("category",category);
      files.forEach(f=>form.append("files",f));
      const res=await fetch("/api/posts",{method:"POST",body:form});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Could not create post.");
      setContent("");setFiles([]);if(inputRef.current)inputRef.current.value="";onCreated();
    } catch(err) {setError(err instanceof Error?err.message:"Something went wrong.");}
    finally{setBusy(false);}
  }
  return <form className="composer" onSubmit={submit}>
    <div className="composer-top"><div className="avatar">You</div><textarea aria-label="Post content" placeholder="What's happening on your campus?" value={content} maxLength={5000} onChange={e=>setContent(e.target.value)}/></div>
    {files.length>0&&<div className="file-preview">{files.map(f=>f.name).join(" · ")}</div>}
    {error&&<div className="notice error" style={{marginTop:10,marginBottom:0}}>{error}</div>}
    <div className="composer-bottom"><div style={{display:"flex",gap:13,alignItems:"center",flexWrap:"wrap"}}>
      <label className="upload-label"><ImagePlus size={17}/> Add media<input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label>
      <select className="select" aria-label="Post category" value={category} onChange={e=>setCategory(e.target.value)} style={{minWidth:130,padding:"8px 10px",fontSize:12}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
    </div><button className="btn" disabled={busy||!content.trim()} type="submit">{busy?"Posting…":<><Send size={15}/> Post</>}</button></div>
  </form>;
}
