import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { Leaf, Navigation, BarChart3, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/src/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
  
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    if (user?.user_metadata.role === "collector") {
      return redirect("/dashboard/collector");
    }

    return redirect("/dashboard/resident");
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "resident" | "collector";
    
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/login?message=Check email to continue sign in process");
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* Background Watermark Logo */}
      <div className="pointer-events-none absolute -left-64 top-20 z-0 opacity-[0.06] dark:opacity-[0.12] lg:-left-32">
        <Leaf className="h-[800px] w-[800px] -rotate-12 text-emerald-600" />
      </div>

      <main className="flex-1 flex flex-col lg:flex-row relative z-10">
      {/* EcoRoute Information Section */}
      <div className="flex flex-1 flex-col justify-center bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 px-8 py-12 lg:px-20 lg:py-24">
        <div className="mb-8 flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <Leaf className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">EcoRoute</h1>
          </Link>
        </div>
        
        <div className="max-w-xl">
          <h2 className="mb-6 text-4xl font-extrabold leading-tight lg:text-5xl text-emerald-900 dark:text-emerald-400">
            The Intelligent Waste Management Solution.
          </h2>
          <p className="mb-10 text-lg text-zinc-600 dark:text-zinc-400">
            Optimize your collection paths, reduce carbon emissions, and build a cleaner future for your community with our data-driven routing engine.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600">
                <Navigation className="h-5 w-5" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Smart Routing</span>
              </div>
              <p className="text-sm text-zinc-500">Dynamic path optimization to minimize fuel consumption.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600">
                <BarChart3 className="h-5 w-5" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Real-time Analytics</span>
              </div>
              <p className="text-sm text-zinc-500">Monitor efficiency and sustainability metrics instantly.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Secure Access</span>
              </div>
              <p className="text-sm text-zinc-500">Tailored experiences for both residents and collectors.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="flex flex-1 items-center justify-center p-8">
        <Tabs defaultValue="sign-in" className="w-full max-w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <form>
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Welcome back! Please sign in to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  formAction={signIn} 
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md shadow-emerald-900/10"
                >
                  Sign In
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="sign-up">
          <form>
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <RadioGroup
                    defaultValue="resident"
                    name="role"
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="resident" id="resident" />
                      <Label htmlFor="resident">Resident</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="collector" id="collector" />
                      <Label htmlFor="collector">Collector</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  formAction={signUp} 
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md shadow-emerald-900/10"
                >
                  Sign Up
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
      </div>
      </main>

      <footer className="relative z-10 border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          © 2024 EcoRoute Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
