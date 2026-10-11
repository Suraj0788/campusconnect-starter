import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req:Request){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const url=new URL(req.url);const category=url.searchParams.get("category");const q=url.searchParams.get("q")?.trim().slice(0,100);
 const db=await createServerSupabaseClient();
 let query=db.from("posts").select("*,profiles(user_id,full_name,bio,major,graduation_year,avatar_url),post_media(*),likes(user_id),comments(id,post_id,author_id,content,created_at,profiles(user_id,full_name,avatar_url))").order("created_at",{ascending:false}).limit(60);
 if(category)query=query.eq("category",category);
 if(q){const safe=q.replace(/[,%()]/g," ");query=query.or(`content.ilike.%${safe}%,category.ilike.%${safe}%`);}
 const {data,error}=await query;
 if(error)return NextResponse.json({error:error.message},{status:400});
 let posts=(data||[]) as any[];
 if(q){const needle=q.toLowerCase();posts=posts.filter(p=>String(p.profiles?.full_name||"").toLowerCase().includes(needle)||String(p.content||"").toLowerCase().includes(needle)||String(p.category||"").toLowerCase().includes(needle));}
 posts=posts.map(p=>({...p,like_count:p.likes?.length||0,comment_count:p.comments?.length||0,comments:(p.comments||[]).sort((a:any,b:any)=>a.created_at.localeCompare(b.created_at))}));
 return NextResponse.json({posts});
}

export async function POST(req:Request){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const form=await req.formData();const content=String(form.get("content")||"").trim();const category=String(form.get("category")||"Other");
 const allowed=["Events","Study","Projects","Announcements","Questions","Other"];
 if(!content||content.length>5000)return NextResponse.json({error:"Post text must be between 1 and 5000 characters."},{status:400});
 if(!allowed.includes(category))return NextResponse.json({error:"Choose a valid category."},{status:400});
 const files=form.getAll("files").filter((x):x is File=>x instanceof File&&x.size>0);
 if(files.length>4)return NextResponse.json({error:"Attach up to 4 files per post."},{status:400});
 const db=await createServerSupabaseClient();
 const {data:profile}=await db.from("profiles").select("user_id").eq("user_id",userId).maybeSingle();
 if(!profile)return NextResponse.json({error:"Create your profile before posting."},{status:400});
 const {data:post,error}=await db.from("posts").insert({author_id:userId,content,category}).select().single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 const mediaRows:any[]=[];
 for(const file of files){
  const allowedType=["image/jpeg","image/png","image/webp","application/pdf"];
  if(!allowedType.includes(file.type)||file.size>10*1024*1024){await db.from("posts").delete().eq("id",post.id);return NextResponse.json({error:`${file.name}: use JPG, PNG, WebP, or PDF up to 10 MB.`},{status:400});}
  const path=`${userId}/${post.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
  const bytes=Buffer.from(await file.arrayBuffer());
  const {error:uploadError}=await db.storage.from("campus-media").upload(path,bytes,{contentType:file.type,upsert:false});
  if(uploadError){await db.from("posts").delete().eq("id",post.id);return NextResponse.json({error:`Upload failed: ${uploadError.message}. Check the campus-media storage bucket and policies.`},{status:400});}
  const {data:publicData}=db.storage.from("campus-media").getPublicUrl(path);
  mediaRows.push({post_id:post.id,file_path:path,file_type:file.type,original_name:file.name,public_url:publicData.publicUrl});
 }
 if(mediaRows.length){const {error:mediaError}=await db.from("post_media").insert(mediaRows);if(mediaError)return NextResponse.json({error:mediaError.message},{status:400});}
 return NextResponse.json({post}, {status:201});
}
