import Link from "next/link";
import { Home, Search, UserRound, PlusCircle } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Brand } from "@/components/brand";

export function Shell({ children, active = "Home" }: { children: React.ReactNode; active?: string }) {
  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/search", icon: Search },
    { label: "Create post", href: "/?compose=1", icon: PlusCircle },
    { label: "Profile", href: "/profile", icon: UserRound }
  ];
  return <div className="app-shell">
    <header className="topbar"><Brand/><div className="top-actions"><Link className="btn secondary" href="/?compose=1"><PlusCircle size={16}/> Create post</Link><UserButton afterSignOutUrl="/"/></div></header>
    <div className="layout">
      <aside className="sidebar">
        <div className="side-label">Campus space</div>
        {links.map(({label,href,icon:Icon})=><Link key={label} className={`side-link ${active===label?"active":""}`} href={href}><Icon size={18}/>{label}</Link>)}
        <div className="side-label">Your community</div><p style={{padding:"0 12px",fontSize:12,color:"#71817b",lineHeight:1.7}}>A place to share knowledge, find teammates, and stay in the loop.</p>
        <div style={{marginTop:22,padding:12,background:"#e8f6ef",borderRadius:12,fontSize:12,color:"#075b45"}}><strong>Connect · Share · Grow</strong><p style={{margin:"6px 0 0",lineHeight:1.5}}>Your campus, your community.</p></div>
      </aside>
      <main className="main">{children}</main>
      <aside className="right-stack">
        <section className="panel"><h3>Community guidelines</h3><p style={{fontSize:13,color:"#71817b",lineHeight:1.7,margin:0}}>Be kind, credit creators, and keep personal information private. Share helpful and accurate campus updates.</p></section>
        <section className="panel"><h3>Explore categories</h3>{["Events","Study","Projects","Announcements","Questions"].map((x)=><div className="quick-stat" key={x}><span>#{x}</span><Link href={`/search?category=${x}`}><span>Explore →</span></Link></div>)}</section>
        <p className="footer-note">CampusConnect · Built for student communities</p>
      </aside>
    </div>
    <nav className="mobile-nav">{links.map(({label,href,icon:Icon})=><Link key={label} className={active===label?"active":""} href={href}><Icon size={19}/><span>{label}</span></Link>)}</nav>
  </div>;
}
