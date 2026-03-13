import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Leaf, Navigation, BarChart3, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Background Watermark Logo Wrapper - ensures horizontal clipping without breaking sticky header */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-64 top-20 opacity-[0.06] dark:opacity-[0.12] lg:-left-32">
          <Leaf className="h-[800px] w-[800px] -rotate-12 text-emerald-600" />
        </div>
      </div>

      {/* Header/Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-2 sm:px-4 lg:px-6">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400">EcoRoute</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-emerald-700 transition-colors">Features</Link>
            <Link href="#impact" className="text-sm font-medium text-zinc-600 hover:text-emerald-700 transition-colors">Impact</Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-full text-zinc-600 hover:text-emerald-700">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md shadow-emerald-900/10">Join Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white pt-12 pb-24 lg:pt-20 lg:pb-44 dark:bg-zinc-950">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:text-emerald-400">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live in 50+ communities
              </div>
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl dark:text-zinc-50 leading-[1.1]">
              Revolutionizing Waste Management with <span className="text-emerald-600">AI Intelligence</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl sm:text-2xl leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
              EcoRoute optimizes collection paths, reduces carbon footprint, and empowers communities to build a cleaner future.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg shadow-emerald-900/20">
                  Collector Login
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 border-emerald-200 text-emerald-900 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 rounded-full shadow-sm">
                  Resident Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                Powerful Features for a Cleaner Planet
              </h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-zinc-900">
                <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
                  <Navigation className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-emerald-900 dark:text-emerald-400">Smart Routing</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Our AI engine calculates the most efficient paths for collection vehicles, reducing fuel consumption by up to 30%.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-zinc-900">
                <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-emerald-900 dark:text-emerald-400">Real-time Analytics</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Monitor efficiency and sustainability metrics instantly through our data-driven dashboard.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-zinc-900">
                <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-emerald-900 dark:text-emerald-400">Secure Access</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Tailored experiences with enterprise-grade security for both residents and service collectors.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="my-4 w-full border-t border-zinc-200 dark:border-zinc-800" />

        {/* Impact Section */}
        <section id="impact" className="py-20 lg:py-32 bg-emerald-950 text-white overflow-hidden relative scroll-mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Our Measurable Impact</h2>
              <p className="text-emerald-100/80 text-xl max-w-2xl mx-auto">Driving sustainability through data-driven operational excellence and route intelligence.</p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-3 text-center">
              <div>
                <div className="text-6xl lg:text-7xl font-extrabold text-emerald-400 mb-4 tracking-tighter">30%</div>
                <div className="text-xl font-bold uppercase tracking-widest text-emerald-100/90">CO2 Reduction</div>
                <p className="mt-6 text-emerald-100/60 text-lg leading-relaxed">Lowering the carbon footprint of collection fleets through optimized routing.</p>
              </div>
              <div>
                <div className="text-6xl lg:text-7xl font-extrabold text-emerald-400 mb-4 tracking-tighter">25k+</div>
                <div className="text-xl font-bold uppercase tracking-widest text-emerald-100/90">Tons Diverted</div>
                <p className="mt-6 text-emerald-100/60 text-lg leading-relaxed">Systematically managing waste collection to maximize recycling efficiency.</p>
              </div>
              <div>
                <div className="text-6xl lg:text-7xl font-extrabold text-emerald-400 mb-4 tracking-tighter">15%</div>
                <div className="text-xl font-bold uppercase tracking-widest text-emerald-100/90">Fuel Saved</div>
                <p className="mt-6 text-emerald-100/60 text-lg leading-relaxed">Significant reduction in operational costs and resource consumption.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dev Bypass Section */}
        <section className="bg-zinc-100 py-12 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Development Tools</span>
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/dashboard/resident">
                <Button variant="secondary" size="sm" className="bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                  ⚡ Dev Bypass: Resident
                </Button>
              </Link>
              <Link href="/dashboard/collector">
                <Button variant="secondary" size="sm" className="bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                  ⚡ Dev Bypass: Collector
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          © 2024 EcoRoute Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
