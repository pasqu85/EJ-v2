import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconUserSearch, IconX, IconChevronRight, IconChevronLeft } from "@tabler/icons-react";

type BubbleJob = {
  id: string;
  message: string;
  role: string;
  type: "indeterminato" | "extra";
};

export default function FloatingBubble({ bubbleJobs, onApply }: { bubbleJobs: BubbleJob[], onApply: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  
  const constraintsRef = useRef(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  if (bubbleJobs.length === 0) return null;

  const calculatePosition = () => {
    if (!bubbleRef.current) return;
    const rect = bubbleRef.current.getBoundingClientRect();
    const padding = 20;
    const popupWidth = 280;
    const popupHeight = 240;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let finalLeft = 70; 
    let finalTop = 0;   

    if (rect.right + popupWidth + padding > screenWidth) finalLeft = -(popupWidth + 10);
    if (rect.left + finalLeft < padding) finalLeft = padding - rect.left;
    if (rect.top + popupHeight + padding > screenHeight) finalTop = -(popupHeight - 40); 
    if (rect.top + finalTop < padding) finalTop = padding - rect.top;

    setCoords({ left: finalLeft, top: finalTop });
  };

  const handleToggle = () => {
    if (isDragging.current) return;
    if (!isOpen) calculatePosition();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[999]">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={() => { 
          setTimeout(() => { isDragging.current = false; }, 100);
          if (isOpen) calculatePosition();
        }}
        className="fixed top-24 right-6 pointer-events-auto"
      >
        {/* BOLLICINA */}
        <motion.div
          ref={bubbleRef}
          animate={!isOpen ? { y: [0, -8, 0], scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          onClick={handleToggle}
          className="relative w-14 h-14 !rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg border-2 border-white/70"
          style={{
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15), inset 0 0 10px rgba(255,255,255,0.4)"
          }}
        >
          <IconUserSearch size={24} className="text-emerald-600 pointer-events-none" />
          {bubbleJobs.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 !rounded-full flex items-center justify-center border-2 border-white">
              {bubbleJobs.length}
            </div>
          )}
        </motion.div>

        {/* POPUP STILE "BOLLICINA" (Glassmorphism) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute w-[280px] !rounded-[32px] p-6 border-2 border-white/60 shadow-2xl cursor-default overflow-hidden"
              style={{
                left: coords.left,
                top: coords.top,
                background: "rgba(255, 255, 255, 0.55)", // Trasparenza come bolla
                backdropFilter: "blur(20px)",            // Effetto vetro sfocato
                boxShadow: "0 20px 50px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.5)", // Riflesso interno
                transition: "left 0.3s ease, top 0.3s ease"
              }}
            >
              {/* Pulsante chiusura discreto */}
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-5 text-slate-500/60 hover:text-slate-800 transition-colors">
                <IconX size={20} stroke={3} />
              </button>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-800 text-[10px] font-black rounded-full uppercase border border-emerald-500/20">
                    {bubbleJobs[currentIndex].type}
                  </span>
                </div>
                
                <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight">
                  {bubbleJobs[currentIndex].role}
                </h3>
                
                <p className="text-slate-700/80 text-sm italic leading-relaxed font-medium">
                  "{bubbleJobs[currentIndex].message}"
                </p>

                <button 
                  onClick={(e) => { e.stopPropagation(); onApply(bubbleJobs[currentIndex].id); }}
                  className="w-full py-3.5 bg-emerald-600 text-white !rounded-[20px] font-black text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Applica Ora
                </button>

                {bubbleJobs.length > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-white/30">
                    <button onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0} className="disabled:opacity-20 text-slate-600">
                      <IconChevronLeft size={22} stroke={2.5} />
                    </button>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {currentIndex + 1} / {bubbleJobs.length}
                    </span>
                    <button onClick={() => setCurrentIndex(c => Math.min(bubbleJobs.length - 1, c + 1))} disabled={currentIndex === bubbleJobs.length - 1} className="disabled:opacity-20 text-slate-600">
                      <IconChevronRight size={22} stroke={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}