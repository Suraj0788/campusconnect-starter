import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
type Ctx={params:Promise<{postId:string}>};
export async function PATCH(req:Request,ctx:Ctx){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const {postId}=await ctx.params;const body=await req.json();const content=typeof body.content==="string"?body.content.trim():"";
 if(!content||content.length>5000)return NextResponse.json({error:"Post text must be between 1 and 5000 characters."},{status:400});
 const db=await createServerSupabaseClient();
 const {data,error}=await db.from("posts").update({content,updated_at:new Date().toISOString()}).eq("id",postId).eq("author_id",userId).select().maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:400});
 if(!data)return NextResponse.json({error:"Post not found or you do not own it."},{status:404});
 return NextResponse.json({post:data});
}
export async function DELETE(_req:Request,ctx:Ctx){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const {postId}=await ctx.params;const db=await createServerSupabaseClient();
 const {data:media}=await db.from("post_media").select("file_path").eq("post_id",postId);
 const {data,error}=await db.from("posts").delete().eq("id",postId).eq("author_id",userId).select("id").maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:400});
 if(!data)return NextResponse.json({error:"Post not found or you do not own it."},{status:404});
 if(media?.length)await db.storage.from("campus-media").remove(media.map(m=>m.file_path));
 return NextResponse.json({success:true});
}
