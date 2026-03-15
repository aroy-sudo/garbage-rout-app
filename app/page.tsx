import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Leaf, Navigation, BarChart3, ShieldCheck } from "lucide-react";
import FaqSection from "@/components/FaqSection";
import InitiativesSection from "@/components/InitiativesSection";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50" id="page-root">
      {/* Background Watermark Logo Wrapper - ensures horizontal clipping without breaking sticky header */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-64 top-20 opacity-[0.06] dark:opacity-[0.12] lg:-left-32">
          <Leaf className="h-[800px] w-[800px] -rotate-12 text-emerald-600" />
        </div>
      </div>

      {/* Header/Nav */}
      <header className="absolute top-0 left-0 w-full z-50 border-b border-white/10 bg-transparent backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-2 sm:px-4 lg:px-6">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-white/15 p-2 backdrop-blur-sm">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-white drop-shadow-md">EcoRoute</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-white/80 hover:text-emerald-400 transition-colors drop-shadow">Features</Link>
            <Link href="#impact" className="text-sm font-medium text-white/80 hover:text-emerald-400 transition-colors drop-shadow">Impact</Link>
            <Link href="#initiatives" className="text-sm font-medium text-white/80 hover:text-emerald-400 transition-colors drop-shadow">Initiatives</Link>
            <Link href="#faq" className="text-sm font-medium text-white/80 hover:text-emerald-400 transition-colors drop-shadow">FAQ</Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-full text-white/80 hover:text-white hover:bg-white/10">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-md border border-emerald-500/40">Join Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center bg-zinc-950">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-50 z-0"
          >
            <source src="/videos/recycling-hero.mp4" type="video/mp4" />
          </video>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-[1]" />

          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center rounded-full bg-emerald-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live in 50+ communities
              </div>
            </div>
            <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1] drop-shadow-2xl">
              Revolutionizing Plastic Waste Management with <span className="text-emerald-400">AI Intelligence</span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-xl sm:text-2xl leading-relaxed text-zinc-200 font-medium drop-shadow-md">
              EcoRoute optimizes collection paths, reduces carbon footprint, and empowers communities to build a cleaner future.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row flex-wrap">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all duration-300 text-lg font-semibold backdrop-blur-sm border border-emerald-500/30">
                  Collector Login
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/25 text-white hover:bg-white/15 hover:border-white/40 rounded-full shadow-sm bg-white/10 backdrop-blur-md transition-all duration-300 text-lg font-semibold hover:-translate-y-0.5">
                  Resident Login
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/25 text-white hover:bg-white/15 hover:border-white/40 rounded-full shadow-sm bg-white/10 backdrop-blur-md transition-all duration-300 text-lg font-semibold hover:-translate-y-0.5">
                  Recycler Login
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/25 text-white hover:bg-white/15 hover:border-white/40 rounded-full shadow-sm bg-white/10 backdrop-blur-md transition-all duration-300 text-lg font-semibold hover:-translate-y-0.5">
                  Admin Login
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

        {/* Initiatives Section */}
        <InitiativesSection />

        {/* FAQ Section */}
        <FaqSection />

        {/* Dev Bypass Section */}
        <section className="bg-zinc-100 py-12 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Development Tools</span>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Link href="/dashboard/resident">
                <Button variant="secondary" size="sm" className="bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/40">
                  ⚡ Dev Bypass: Resident
                </Button>
              </Link>
              <Link href="/dashboard/collector">
                <Button variant="secondary" size="sm" className="bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/40">
                  ⚡ Dev Bypass: Collector
                </Button>
              </Link>
              <Link href="/dashboard/wasterecycler">
                <Button variant="secondary" size="sm" className="bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/40">
                  ⚡ Dev Bypass: Recycler
                </Button>
              </Link>
              <Link href="/dashboard/admin">
                <Button variant="secondary" size="sm" className="bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/40">
                  ⚡ Dev Bypass: Admin
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          © 2026 EcoRoute Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
