import { SignUp } from "@clerk/nextjs";
export default function SignUpPage(){return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f7faf8"}}><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" /></div>}
