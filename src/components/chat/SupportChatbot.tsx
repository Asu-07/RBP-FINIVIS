import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportChatbot() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {isHovered ? (
          // Expanded Panel
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm"
          >
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Need Help?
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Our customer care team is here to assist you
            </p>

            <div className="space-y-3">
              {/* Phone Support */}
              <a
                href="tel:+917717309363"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Call Us</p>
                  <p className="text-xs text-gray-600">+91 7717309363</p>
                </div>
              </a>

              {/* Email Support */}
              <a
                href="mailto:support@rbpfinivis.com"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Email Us</p>
                  <p className="text-xs text-gray-600">support@rbpfinivis.com</p>
                </div>
              </a>

              {/* WhatsApp Support */}
              <Button
                variant="outline"
                className="w-full text-sm"
                type="button"
                onClick={() => {
                  window.open('https://wa.me/917717309363', '_blank');
                }}
              >
                Chat on WhatsApp
              </Button>
            </div>
          </motion.div>
        ) : (
          // Compact Icon
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative group cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Contact Us
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}