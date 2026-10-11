import Link from "next/link";
import { Home, Search, UserRound, PlusCircle, GraduationCap } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Brand } from "@/components/brand";

export function AppNav({ active = "Home" }: { active?: string }) {
  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/search", icon: Search },
    { label: "Create post", href: "/?compose=1", icon: PlusCircle },
    { label: "Profile", href: "/profile", icon: UserRound }
  ];
  return <>
    <header className="topbar"><Brand/><div className="top-actions"><Link className="btn secondary" href="/?compose=1"><PlusCircle size={16}/> Create post</Link><UserButton afterSignOutUrl="/"/></div></header>
    <div className="layout">
      <aside className="sidebar">
        <div className="side-label">Campus space</div>
        {links.map(({label,href,icon:Icon})=><Link key={label} className={`side-link ${active===label?"active":""}`} href={href}><Icon size={18}/>{label}</Link>)}
        <div className="side-label">Your community</div>
        <div style={{padding:"10px 12px",fontSize:12,color:"#71817b",lineHeight:1.7}}>A place to share knowledge, find teammates, and stay in the loop.</div>
        <div style={{marginTop:24,padding:"12px",background:"#e8f6ef",borderRadius:12,fontSize:12,color:"#075b45"}}><GraduationCap size={18}/><p style={{margin:"7px 0 0",fontWeight:700}}>Connect · Share · Grow</p></div>
      </aside>
      <main className="main">{/* main content is rendered by the page after this component */}</main>
    </div>
  </>;
}
