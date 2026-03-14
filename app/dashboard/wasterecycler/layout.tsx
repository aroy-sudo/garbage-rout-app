import { Leaf } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logOut } from "../actions";

export default function RecyclerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Recycler Header Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="rounded-md bg-blue-100 p-2 dark:bg-blue-900/30">
              <Leaf className="h-6 w-6 text-blue-600" />
            </div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-400">
              EcoRoute <span className="text-sm ml-2 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-md">Recycling Center</span>
            </Link>
          </div>
          <form action={logOut}>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-md shadow-blue-900/10">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
