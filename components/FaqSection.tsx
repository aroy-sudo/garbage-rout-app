"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl mb-4 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
      >
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 pr-4">{question}</h3>
        <ChevronDown 
          className={`h-5 w-5 text-emerald-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: "How does EcoRoute reduce carbon footprint?",
    answer: "EcoRoute uses advanced AI algorithms to optimize collection paths. By reducing the distance traveled and minimizing idling time, fuel consumption is significantly decreased, directly leading to a lower carbon footprint."
  },
  {
    question: "Who can use the EcoRoute platform?",
    answer: "Our platform is designed for everyone involved in the waste management ecosystem: residents reporting waste, collectors executing optimized routes, recycling facilities tracking diverted materials, and administrators overseeing the entire operation."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we implement enterprise-grade security protocols. All user data, location tracking, and operational metrics are encrypted both in transit and at rest to ensure complete privacy and compliance with data protection regulations."
  },
  {
    question: "Can I track the impact of my recycling efforts?",
    answer: "Absolutely. Residents and communities have access to real-time analytics showing their contribution to waste diversion and CO2 reduction, making the impact of your individual actions transparent and rewarding."
  },
  {
    question: "How do I sign up as a service collector?",
    answer: "Service collectors can join by navigating to the 'Join Now' page, where you will be guided through a secure registration and vetting process to become an authorized operator on the EcoRoute network. We are always looking for dedicated partners."
  }
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-16 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-50 z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-4">
            Got questions?
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Everything you need to know about our platform and impact.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
        
        <div className="mt-12 text-center p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <p className="text-lg text-zinc-700 dark:text-zinc-300 font-medium mb-2">
            Still have questions?
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            Cannot find the answer you are looking for? Our team is ready to help.
          </p>
          <a 
            href="mailto:support@ecoroute.com" 
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
