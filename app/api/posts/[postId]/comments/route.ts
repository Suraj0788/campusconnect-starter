import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function POST(req:Request,ctx:{params:Promise<{postId:string}>}){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const {postId}=await ctx.params;const body=await req.json();const content=typeof body.content==="string"?body.content.trim():"";
 if(!content||content.length>2000)return NextResponse.json({error:"Comment must be between 1 and 2000 characters."},{status:400});
 const db=await createServerSupabaseClient();
 const {data,error}=await db.from("comments").insert({post_id:postId,author_id:userId,content}).select("*,profiles(user_id,full_name,avatar_url)").single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({comment:data},{status:201});
}

export async function DELETE(req:Request,ctx:{params:Promise<{postId:string}>}){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const {postId}=await ctx.params;const {commentId}=await req.json();
 if(typeof commentId!=="string"||!commentId)return NextResponse.json({error:"Comment ID is required."},{status:400});
 const db=await createServerSupabaseClient();
 const {data,error}=await db.from("comments").delete().eq("id",commentId).eq("post_id",postId).eq("author_id",userId).select("id").maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:400});
 if(!data)return NextResponse.json({error:"Comment not found or you do not own it."},{status:404});
 return NextResponse.json({success:true});
}
