import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function PUT(req:Request){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Sign in required."},{status:401});
 const body=await req.json();
 const full_name=typeof body.full_name==="string"?body.full_name.trim().slice(0,80):"";
 const bio=typeof body.bio==="string"?body.bio.trim().slice(0,300):"";
 const major=typeof body.major==="string"?body.major.trim().slice(0,100):"";
 const graduation_year=body.graduation_year==null||body.graduation_year===""?null:Number(body.graduation_year);
 const avatar_url=typeof body.avatar_url==="string"?body.avatar_url.trim().slice(0,1000):"";
 if(!full_name)return NextResponse.json({error:"Name is required."},{status:400});
 if(graduation_year!==null&&(!Number.isInteger(graduation_year)||graduation_year<2020||graduation_year>2045))return NextResponse.json({error:"Enter a valid graduation year."},{status:400});
 if(avatar_url&&!/^https?:\/\//i.test(avatar_url))return NextResponse.json({error:"Avatar must be an HTTP or HTTPS URL."},{status:400});
 const db=await createServerSupabaseClient();
 const {data,error}=await db.from("profiles").upsert({user_id:userId,full_name,bio,major,graduation_year,avatar_url,updated_at:new Date().toISOString()},{onConflict:"user_id"}).select().single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({profile:data});
}
