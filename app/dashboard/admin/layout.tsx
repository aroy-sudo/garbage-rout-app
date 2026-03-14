import { Leaf } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logOut } from "../actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Admin Header Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="rounded-md bg-purple-100 p-2 dark:bg-purple-900/30">
              <Leaf className="h-6 w-6 text-purple-600" />
            </div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-purple-900 dark:text-purple-400">
              EcoRoute <span className="text-sm ml-2 px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-md">Admin Pane</span>
            </Link>
          </div>
          <form action={logOut}>
            <Button size="sm" className="bg-purple-700 hover:bg-purple-800 text-white rounded-full shadow-md shadow-purple-900/10">
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
