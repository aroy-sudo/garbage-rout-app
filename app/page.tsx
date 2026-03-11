import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-4xl text-5xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            EcoRoute: AI-Optimized Waste Management
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A hackathon project for revolutionizing garbage collection routes
            using AI.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/login?role=resident">
            <Button variant="outline">Resident Login</Button>
          </Link>

          <Link href="/login?role=collector">
            <Button>Collector Login</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
