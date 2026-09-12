import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <SignIn
        routing="path"
        path="/login"
        fallbackRedirectUrl="/round-1"
      />
    </main>
  );
}