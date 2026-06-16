import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <p className="section-subtitle">Get in Touch</p>
        <h1 className="section-title">Contact Us</h1>
        <p className="text-gray-400 mt-3 max-w-md mx-auto">Have a question ? We'd love to hear from you!</p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        {/* Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8">
            <h2 className="font-serif text-2xl font-semibold text-rose-900 mb-6">Let's Talk Flowers 🌸</h2>
            <div className="space-y-5">
              {[
                { icon: FiMail, label: 'Email', value: 'hello@lilyslab.com', color: 'text-pink-500' },
                { icon: FiPhone, label: 'WhatsApp / Call', value: '+91 7483890720', color: 'text-green-500' },
                { icon: FiMapPin, label: 'Location', value: 'Mysuru, Karnataka, India', color: 'text-purple-500' },
                { icon: FiClock, label: 'Working-Days', value: 'Mon–Sun', color: 'text-orange-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-gray-700 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/917483890720?text=Hi%20Lily's%20Lab!%20I'm%20interested%20in%20placing%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-green-500 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-green-600 transition-colors shadow-sm"
          >
            <span className="text-2xl">💬</span>
            Chat on WhatsApp
          </a>

          {/* FAQ */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-serif font-semibold text-gray-800 mb-4">Quick FAQ</h3>
            <div className="space-y-3">
              {[
                
                
                ['Can I order same day?', 'We need min. 3 days for orders'],
              ].map(([q, a]) => (
                <div key={q} className="text-sm">
                  <p className="font-medium text-gray-700">❓ {q}</p>
                  <p className="text-gray-400 mt-0.5 pl-5">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        
          
        
      </div>
    </div>
  );
}