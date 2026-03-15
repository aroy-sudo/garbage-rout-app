"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const initiatives = [
  {
    title: "Tetra Pak Initiative",
    description: "The Kabadiwala collaborated with TetraPak India (World's Leading Beverage Carton Manufacturer) to increase the collection of used beverage cartons (UBC's) for recycling and diverting them from landfills.",
    videoSrc: "https://www.youtube.com/embed/6DYlz8NW554",
    link: "#"
  },
  {
    title: "Mattress Circular Journey",
    description: "ISPF, IPUA and The Kabadiwala came together to initiate India's first mattress recycling campaign which is named as 'Feko Nahi Recycle Karo'. The objective is to encourage the community to practise sustainable disposal of Mattress.",
    videoSrc: "https://www.youtube.com/embed/P5OBWbZDZIc",
    link: "#"
  },
  {
    title: "Tree Plantation Initiative",
    description: "Since the last two years, The Kabadiwala has been following a tradition of planting trees on the occasion of Mahatma Gandhi's Birthday. In which, our customers also take part in our mission to turn Bhopal greener.",
    videoSrc: "https://www.youtube.com/embed/0ZiD_Lb3Tm0",
    link: "#"
  },
  {
    title: "Kitab Ghar",
    description: "Kitab Ghar initiative is a combined effort of The Kabadiwala & Bhopal Municipal Corporation that aims at providing second hand books to the underprivileged children by acquiring them from the people who no longer need them.",
    // Using one of the provided YouTube embeds as a placeholder for the Pexels link, as direct iframe embedding of the Pexels page is typically blocked.
    videoSrc: "https://www.youtube.com/embed/0ZiD_Lb3Tm0", 
    link: "https://www.pexels.com/video/people-working-in-a-plastic-factory-for-recycle-3196563/"
  }
];

export default function InitiativesSection() {
  return (
    <section id="initiatives" className="py-24 bg-black text-white overflow-hidden scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Our Initiatives</h2>
          <p className="text-zinc-400 text-lg">
            Small steps towards <span className="text-emerald-500">sustainability.</span>
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
