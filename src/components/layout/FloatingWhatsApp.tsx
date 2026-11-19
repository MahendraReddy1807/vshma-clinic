'use client';

import { motion } from 'framer-motion';
import { CLINIC_INFO } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

export default function FloatingWhatsApp() {
  return (
    <motion.a
      href={CLINIC_INFO.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Dr. Chihnitha on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:shadow-[0_10px_30px_rgba(37,211,102,0.5)] transition-all group"
    >
      <WhatsAppIcon className="h-7 w-7" />
      {/* Tooltip */}
      <span className="absolute right-full mr-3 bg-white text-forest text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-sage/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat on WhatsApp
      </span>
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
    </motion.a>
  );
}
