'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { CheckCircle, Send, FileText, Award, Sparkles, Zap } from 'lucide-react';

interface SuccessAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'submit' | 'success' | 'grade' | 'complete';
  onConfirm?: () => void;
}

export default function SuccessAnimation({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'submit',
  onConfirm 
}: SuccessAnimationProps) {
  
  // Add CSS for confetti animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'success' | 'exit'>('enter');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase('enter');
      setShowConfetti(false);
      
      // Start success animation after enter animation
      const timer1 = setTimeout(() => {
        setAnimationPhase('success');
        setShowConfetti(true);
      }, 300);

      // Auto close after 2 seconds (reduced from 3)
      const timer2 = setTimeout(() => {
        setAnimationPhase('exit');
        setTimeout(() => {
          // Call onConfirm before closing if it exists
          if (onConfirm) onConfirm();
          onClose();
        }, 300);
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'submit':
        return <Send className="h-16 w-16 text-white" />;
      case 'grade':
        return <Award className="h-16 w-16 text-white" />;
      case 'complete':
        return <FileText className="h-16 w-16 text-white" />;
      default:
        return <CheckCircle className="h-16 w-16 text-white" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'submit':
        return {
          bg: 'from-blue-500 to-purple-600',
          ring: 'ring-blue-500',
          button: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        };
      case 'grade':
        return {
          bg: 'from-yellow-500 to-orange-500',
          ring: 'ring-yellow-500',
          button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
        };
      case 'complete':
        return {
          bg: 'from-green-500 to-emerald-600',
          ring: 'ring-green-500',
          button: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        };
      default:
        return {
          bg: 'from-green-500 to-blue-600',
          ring: 'ring-green-500',
          button: 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
        };
    }
  };

  const colors = getColors();

  if (!isOpen) return null;

  return (
    <>
      {/* Confetti Animation - Reduced for better performance */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[10000]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400'][i % 4]
              }`}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animation: `confettiFall ${1 + Math.random()}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            animationPhase === 'enter' ? 'opacity-0' : 
            animationPhase === 'success' ? 'opacity-30' : 'opacity-0'
          }`}
          onClick={onClose}
        />

        {/* Modal Content */}
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl transform transition-all duration-500 ${
            animationPhase === 'enter' ? 'scale-50 opacity-0 rotate-12' : 
            animationPhase === 'success' ? 'scale-100 opacity-100 rotate-0' : 
            'scale-75 opacity-0 -rotate-6'
          }`}
          style={{ maxWidth: '400px', width: '100%' }}
        >
          {/* Gradient Header */}
          <div className={`relative bg-gradient-to-r ${colors.bg} p-8 rounded-t-2xl overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full animate-pulse" />
              <div className="absolute top-6 right-6 w-4 h-4 bg-white rounded-full animate-ping" />
              <div className="absolute bottom-4 left-6 w-6 h-6 border-2 border-white rounded-full animate-bounce" />
              <div className="absolute bottom-6 right-4 w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>

            {/* Success Icon */}
            <div className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-all duration-700 ${
                  animationPhase === 'success' ? 'scale-100 animate-bounce' : 'scale-75'
                } ${colors.ring} ring-4 ring-opacity-50`}
              >
                {getIcon()}
              </div>

              {/* Sparkle Effects */}
              {showConfetti && (
                <>
                  <Sparkles className="absolute top-2 right-8 h-6 w-6 text-yellow-300 animate-spin" />
                  <Zap className="absolute top-4 left-8 h-5 w-5 text-blue-300 animate-pulse" />
                  <Sparkles className="absolute bottom-2 right-12 h-4 w-4 text-pink-300 animate-bounce" />
                  <Zap className="absolute bottom-4 left-12 h-5 w-5 text-green-300 animate-ping" />
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h2 
              className={`text-2xl font-bold text-gray-900 mb-3 transform transition-all duration-500 ${
                animationPhase === 'success' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              {title}
            </h2>
            
            <p 
              className={`text-gray-600 mb-6 transform transition-all duration-500 ${
                animationPhase === 'success' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              {message}
            </p>

            {/* Action Button */}
            <Button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`${colors.button} text-white px-8 py-3 rounded-xl font-semibold transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:animate-bounce ${
                animationPhase === 'success' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="animate-pulse">Yeahh!!!</span>
            </Button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-75" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-pulse opacity-75" />
        </div>
      </div>
    </>
  );
}

// Custom Hook for Success Animation
export function useSuccessAnimation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    type?: 'submit' | 'success' | 'grade' | 'complete';
    onConfirm?: () => void;
  }>({
    title: '',
    message: '',
    type: 'success'
  });

  const showSuccess = (
    title: string, 
    message: string, 
    type: 'submit' | 'success' | 'grade' | 'complete' = 'success',
    onConfirm?: () => void
  ) => {
    setConfig({ title, message, type, onConfirm });
    setIsOpen(true);
  };

  const closeSuccess = () => {
    setIsOpen(false);
  };

  return {
    showSuccess,
    closeSuccess,
    isOpen,
    config
  };
}
