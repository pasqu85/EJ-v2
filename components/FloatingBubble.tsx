import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconUserSearch, IconX, IconChevronRight, IconChevronLeft } from "@tabler/icons-react";

// Tipi per i lavori "speciali" (Indeterminato / Urgente)
type BubbleJob = {
  id: string;
  message: string;
  role: string;
  type: "indeterminato" | "extra";
};

export default function FloatingBubble({ bubbleJobs, onApply }: { bubbleJobs: BubbleJob[], onApply: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (bubbleJobs.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[999]">
      {/* BOLLICINA FLUTTUANTE */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.05, 1] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        onClick={() => setIsOpen(true)}
        className="relative w-16 h-16 rounded-full cursor-pointer flex items-center justify-center shadow-lg overflow-visible"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(255, 255, 255, 0.7)",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15), inset 0 0 15px rgba(255,255,255,0.6)"
        }}
      >
        {/* Riflesso della bolla */}
        <div className="absolute top-2 left-3 w-4 h-2 bg-white rounded-full opacity-60 rotate-[-20deg]" />
        
        <IconUserSearch size={28} className="text-emerald-600" />

        {/* Numerino badge */}
        {bubbleJobs.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {bubbleJobs.length}
          </div>
        )}
      </motion.div>

      {/* POPUP AL CLIC */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="absolute top-0 right-20 w-72 bg-white rounded-[24px] shadow-2xl p-5 border border-slate-100"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-slate-400">
              <IconX size={18} />
            </button>

            <div className="overflow-hidden">
              <motion.div 
                key={currentIndex}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-3"
              >
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">
                  {bubbleJobs[currentIndex].type}
                </div>
                
                <h3 className="font-black text-slate-800 text-lg leading-tight">
                  {bubbleJobs[currentIndex].role}
                </h3>
                
                <p className="text-slate-500 text-sm italic font-medium">
                  "{bubbleJobs[currentIndex].message}"
                </p>

                <button 
                  onClick={() => onApply(bubbleJobs[currentIndex].id)}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-sm shadow-md shadow-emerald-200 active:scale-95 transition-transform"
                >
                  APPLICA ORA
                </button>
              </motion.div>
            </div>

            {/* Navigazione Swipe/Frecce se > 1 */}
            {bubbleJobs.length > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(c => c - 1)}
                  className={`p-1 ${currentIndex === 0 ? 'text-slate-200' : 'text-slate-400'}`}
                >
                  <IconChevronLeft size={20} />
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {currentIndex + 1} di {bubbleJobs.length}
                </span>
                <button 
                  disabled={currentIndex === bubbleJobs.length - 1}
                  onClick={() => setCurrentIndex(c => c + 1)}
                  className={`p-1 ${currentIndex === bubbleJobs.length - 1 ? 'text-slate-200' : 'text-slate-400'}`}
                >
                  <IconChevronRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}