import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const MESSENGER_PAGE_ID = 'ZwerenPh';
const MESSENGER_URL = `https://m.me/${MESSENGER_PAGE_ID}`;

const MessengerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.98-.87c.17-.08.36-.09.54-.04.91.25 1.87.38 2.9.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm6 7.46l-2.94 4.66c-.47.74-1.47.93-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66c.47-.74 1.47-.93 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63z" />
  </svg>
);

interface MessengerChatProps {
  // Lift above the mobile floating cart button when it is visible
  raised?: boolean;
}

const MessengerChat: React.FC<MessengerChatProps> = ({ raised = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);

  // Show a small "Message us" bubble a few seconds after load
  useEffect(() => {
    const timer = setTimeout(() => setShowTeaser(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const openMessenger = () => {
    window.open(MESSENGER_URL, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
    setShowTeaser(false);
  };

  return (
    <div className={`fixed right-6 z-40 flex flex-col items-end ${raised ? 'bottom-28 md:bottom-6' : 'bottom-6'}`}>
      {/* Chat popup */}
      {isOpen && (
        <div className="mb-4 w-72 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in origin-bottom-right">
          <div className="bg-gradient-to-r from-[#0084FF] to-[#A033FF] p-4 text-white flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/zweren-logo.jpg"
                alt="Zweren Ph"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
              />
              <div>
                <p className="font-bold text-sm">Zweren Ph</p>
                <p className="text-xs text-white/80">Typically replies within an hour</p>
              </div>
            </div>
            <button onClick={toggle} className="text-white/80 hover:text-white" aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 bg-zweren-gray">
            <div className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-700 shadow-sm">
              Hi! 👋 Welcome to Zweren Ph. Questions about sizes, stocks, or your order? Chat with us on Messenger!
            </div>
          </div>

          <div className="p-4 pt-0 bg-zweren-gray">
            <button
              onClick={openMessenger}
              className="w-full flex items-center justify-center space-x-2 bg-[#0084FF] hover:bg-[#0073E0] text-white font-bold text-sm py-3 rounded-full transition-colors"
            >
              <MessengerIcon className="h-5 w-5" />
              <span>Message us on Messenger</span>
            </button>
          </div>
        </div>
      )}

      {/* Teaser bubble */}
      {!isOpen && showTeaser && (
        <div className="mb-3 flex items-center bg-white rounded-full shadow-lg pl-4 pr-2 py-2 animate-fade-in">
          <button onClick={toggle} className="text-sm font-semibold text-gray-800">
            Message us on Messenger
          </button>
          <button
            onClick={() => setShowTeaser(false)}
            className="ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close Messenger chat' : 'Open Messenger chat'}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-[#0084FF] to-[#A033FF] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 ring-4 ring-white"
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessengerIcon className="h-7 w-7" />}
      </button>
    </div>
  );
};

export default MessengerChat;
