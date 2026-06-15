// Modal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-6 w-full ${maxWidth} shadow-xl`}>
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg font-semibold text-gray-800">{title}</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-pink-50 rounded-xl text-gray-400 transition-colors">
                  <FiX size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}