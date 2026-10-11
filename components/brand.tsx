import Link from "next/link";
import { GraduationCap } from "lucide-react";
export function Brand() {
  return <Link className="brand" href="/"><span className="brand-mark"><GraduationCap size={22}/></span><span>Campus<span>Connect</span></span></Link>;
}
