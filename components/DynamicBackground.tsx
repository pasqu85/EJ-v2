"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const DynamicBackground = () => {
  const { scrollYProgress } = useScroll();

  // Movimenti differenziati per le forme
  const circleY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const squareRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const triangleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#fafaf9] pointer-events-none">
      
      {/* Cerchio Pastello - Alto Sinistra */}
      <motion.div
        style={{ y: circleY }}
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-50"
      />

      {/* Quadrato Rotante - Centro Destra */}
      <motion.div
        style={{ rotate: squareRotate }}
        className="absolute top-1/3 -right-10 w-40 h-40 bg-pink-50 opacity-70"
      />

      {/* Elemento in basso - Sale mentre scendi */}
      <motion.div
        style={{ y: triangleY }}
        className="absolute bottom-[-5%] left-1/4 w-60 h-60 rounded-3xl bg-purple-50 rotate-12"
      />

    </div>
  );
};

export default DynamicBackground;