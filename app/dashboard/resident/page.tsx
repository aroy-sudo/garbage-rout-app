import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/src/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const ResidentMap = dynamic(() => import("@/src/components/ResidentMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function ResidentDashboard() {
  const signOut = async () => {
    "use server";

    const cookieStore =  cookies();
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Card className="w-[800px]">
        <CardHeader>
          <CardTitle>Request a Garbage Pickup</CardTitle>
        </CardHeader>
        <CardContent>
          <ResidentMap />
        </CardContent>
      </Card>
      <form action={signOut}>
        <Button className="mt-4">Sign Out</Button>
      </form>
    </div>
  );
}
