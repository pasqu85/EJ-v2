"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";



type Props = {
  onLogout: () => void;

};

export default function AvatarMenu({
  onLogout,

}: Props) {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();


  useEffect(() => {
    const saved = localStorage.getItem("avatar");
    if (saved) setAvatar(saved);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      localStorage.setItem("avatar", base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      {/* AVATAR BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-10 h-10 !rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold overflow-hidden"
      >
        {avatar ? (
          <img src={avatar} className="w-full h-full object-cover" />
        ) : (
          "👤"
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* OVERLAY */}
            <motion.div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* MENU */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border z-20 overflow-hidden"
            >
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
              >
                📸 Cambia foto
              </button>

<button
  onClick={() => {
    setOpen(false);
    router.push("/profile");
  }}
  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
>
  👤 Profilo
</button>

<button
  onClick={() => {
    setOpen(false);
    router.push("/applications");
  }}
  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
>
  📄 Le mie candidature
</button>


              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-100 transition"
              >
                🚪 Esci
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
