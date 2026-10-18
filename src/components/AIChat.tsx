
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const AIChat: React.FC = () => {
  const location = useLocation();

  // Don't show the floating button if we are already on the IA page
  if (location.pathname === '/ia') return null;

  return (
    <Link
      to="/ia"
      className="fixed bottom-6 right-6 w-14 h-14 gold-gradient rounded-full shadow-2xl flex items-center justify-center text-vertus-bg hover:scale-110 transition-transform duration-300 z-[90] cursor-pointer"
      title="Ir para Consultor IA"
    >
      <MessageSquare className="w-7 h-7" />
    </Link>
  );
};

export default AIChat;
