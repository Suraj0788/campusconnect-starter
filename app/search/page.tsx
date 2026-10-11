import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Feed } from "@/components/feed";
export default async function SearchPage({searchParams}:{searchParams:Promise<{category?:string}>}) {
  const {userId}=await auth();if(!userId)redirect("/sign-in");
  const params=await searchParams;
  return <Shell active="Explore"><Feed currentUserId={userId} userName="Student" searchMode initialCategory={params.category||""}/></Shell>;
}
