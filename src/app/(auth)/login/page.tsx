import { login } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/(auth)/auth-form";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <AuthForm type="login" action={login} />
    </div>
  );
}
