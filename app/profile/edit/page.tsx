import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { ProfileEditor } from "@/components/profile-editor";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export default async function EditProfilePage() {
 const {userId}=await auth();if(!userId)redirect("/sign-in");
 const user=await currentUser();const db=await createServerSupabaseClient();
 const {data}=await db.from("profiles").select("*").eq("user_id",userId).maybeSingle();
 return <Shell active="Profile"><h1 className="page-title">Set up your profile</h1><p className="subheading">Help your campus community get to know you.</p><ProfileEditor initial={data||{user_id:userId,full_name:user?.fullName||"",bio:"",major:"",graduation_year:null,avatar_url:user?.imageUrl||""}}/></Shell>;
}
