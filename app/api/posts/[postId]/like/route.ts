import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function POST(_req:Request,ctx:{params:Promise<{postId:string}>}){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const {postId}=await ctx.params;const db=await createServerSupabaseClient();
 const {data:existing,error:readError}=await db.from("likes").select("post_id").eq("post_id",postId).eq("user_id",userId).maybeSingle();
 if(readError)return NextResponse.json({error:readError.message},{status:400});
 let liked:boolean;
 if(existing){const {error}=await db.from("likes").delete().eq("post_id",postId).eq("user_id",userId);if(error)return NextResponse.json({error:error.message},{status:400});liked=false;}
 else{const {error}=await db.from("likes").insert({post_id:postId,user_id:userId});if(error&&error.code!=="23505")return NextResponse.json({error:error.message},{status:400});liked=true;}
 const {count,error:countError}=await db.from("likes").select("*",{count:"exact",head:true}).eq("post_id",postId);
 if(countError)return NextResponse.json({error:countError.message},{status:400});
 return NextResponse.json({liked,likeCount:count||0});
}
