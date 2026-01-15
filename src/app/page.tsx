import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

type SearchParams = {
  code?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  // Supabase email confirmation returns to "/?code=..."
  // Forward it to our callback route to exchange the code for a session.
  if (sp.code) {
    redirect(`/auth/callback?code=${sp.code}`);
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16">
        <header className="space-y-4">
          <p className="text-sm text-muted-foreground">Portfolio Project</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI-Powered Internal Tool
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            A production-grade internal dashboard template built with Next.js,
            Supabase, and Gemini.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </header>
      </div>
    </main>
  );
}
