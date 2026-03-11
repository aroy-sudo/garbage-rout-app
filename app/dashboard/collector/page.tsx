import { Button } from "@/components/ui/button";
import { createClient } from "@/src/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function CollectorDashboard() {
  const signOut = async () => {
    "use server";

    const cookieStore = await cookies();
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-[800px]">
        <h1 className="mb-4 text-2xl font-semibold">Collector Dashboard</h1>
        <div className="rounded-lg border bg-white p-4 dark:border-zinc-800 dark:bg-black">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <li className="py-2">Route 1</li>
            <li className="py-2">Route 2</li>
            <li className="py-2">Route 3</li>
          </ul>
        </div>
      </div>
      <form action={signOut}>
        <Button className="mt-4">Sign Out</Button>
      </form>
    </div>
  );
}
