"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const defaultFaqs: FAQItem[] = [
  {
    question: "How do I schedule a plastic pickup?",
    answer: "You can schedule a pickup directly from your dashboard by clicking the 'Request Pickup' button. Or, call our toll-free number from your registered mobile device.",
  },
  {
    question: "When will the collector arrive?",
    answer: "Our AI routing system dispatches the nearest active collector. You can track their real-time location on the live map in your dashboard.",
  },
  {
    question: "How is the payment calculated?",
    answer: "Payments are calculated based on the weight and type of plastic (PET, HDPE, LDPE, PP) measured digitally at the time of collection. Funds are instantly transferred to your linked account.",
  },
  {
    question: "What types of plastics are accepted?",
    answer: "We primarily accept and process PET (water bottles), HDPE (milk jugs, detergent bottles), LDPE (bags, films), and PP (containers, caps). Please ensure items are relatively clean and empty.",
  },
];

export default function FAQSection({
  title = "Frequently Asked Questions",
  faqs = defaultFaqs,
}: {
  title?: string;
  faqs?: FAQItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-12 px-4 sm:px-6 mt-8 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 rounded-3xl shadow-sm">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 text-center">
          {title}
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen 
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-500/50 shadow-sm" 
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-sm sm:text-base ${isOpen ? "text-emerald-900 dark:text-emerald-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 p-1 rounded-full transition-colors ${isOpen ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-5 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-emerald-100 dark:border-emerald-900/30">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
