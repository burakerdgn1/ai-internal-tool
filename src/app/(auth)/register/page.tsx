import { register } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/(auth)/auth-form";

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <AuthForm type="register" action={register} />
    </div>
  );
}
