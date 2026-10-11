import { SignIn } from "@clerk/nextjs";
export default function SignInPage(){return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f7faf8"}}><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" /></div>}
