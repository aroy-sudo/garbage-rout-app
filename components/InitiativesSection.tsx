"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const initiatives = [
  {
    title: "Beverage Carton Recycling",
    description: "Learn how used beverage cartons like juice and milk packs can be collected and recycled instead of being sent to landfills. Understand your role in driving circular economy at the community level.",
    videoSrc: "https://www.youtube.com/embed/6DYlz8NW554",
    link: "#"
  },
  {
    title: "Don't Throw — Recycle!",
    description: "Discover how old mattresses can be responsibly recycled through India's first mattress recycling campaign. See how communities can shift from dumping to sustainable disposal practices.",
    videoSrc: "https://www.youtube.com/embed/P5OBWbZDZIc",
    link: "#"
  },
  {
    title: "Green Bhopal: Tree Plantation Drive",
    description: "Watch how communities come together to plant trees and restore green cover in urban and rural areas. Every tree planted is a step toward cleaner air and a healthier environment for future generations.",
    videoSrc: "https://www.youtube.com/embed/0ZiD_Lb3Tm0",
    link: "#"
  },
  {
    title: "Books for All: Kitab Ghar",
    description: "See how old textbooks and books are collected from households and redistributed to underprivileged rural children. A simple act of giving away books creates a lasting impact on rural education.",
    videoSrc: "https://www.youtube.com/embed/0ZiD_Lb3Tm0", 
    link: "https://www.pexels.com/video/people-working-in-a-plastic-factory-for-recycle-3196563/"
  }
];

export default function InitiativesSection() {
  return (
    <section id="initiatives" className="py-24 bg-black text-white overflow-hidden scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Rural Awareness</h2>
          <p className="text-zinc-400 text-lg">
            Educate and <span className="text-emerald-500">Implement.</span>
          </p>
        </div>

        <div className="relative">
          {/* Fading edges for the scroll container to indicate scrollability on desktop */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none md:hidden"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none md:hidden"></div>

          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 -mx-4 sm:px-0 sm:mx-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {initiatives.map((item, index) => (
              <div 
                key={index} 
                className="min-w-[85vw] sm:min-w-[320px] max-w-[350px] flex-shrink-0 snap-center bg-zinc-900 rounded-2xl overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:bg-zinc-800/80 hover:shadow-xl hover:shadow-black/50 duration-300 border border-zinc-800/50"
              >
                <div className="aspect-video w-full bg-zinc-950 relative border-b border-zinc-800/50">
                  <iframe 
                    src={item.videoSrc}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 absolute inset-0"
                  />
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-zinc-50 tracking-wide">{item.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">
                    {item.description}
                  </p>
                  <Link 
                    href={item.link} 
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    className="inline-flex items-center text-emerald-500 font-semibold hover:text-emerald-400 transition-colors w-fit text-sm uppercase tracking-wider"
                  >
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
