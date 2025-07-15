'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface MotivationalQuoteProps {
  quotes: string[]
  speed?: string
}

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ 
  quotes,
  speed = '1'
}) => {
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  useEffect(() => {
    let isSubscribed = true;

    const animate = async () => {
      if (!isSubscribed) return;
      
      const currentQuote = quotes[currentQuoteIndex];
      const quoteLength = currentQuote.length;
      const baseDuration = 20; // 基準となる持続時間（秒）
      const adjustedDuration = Math.max(baseDuration, quoteLength / 10); // 文字数に応じて調整

      try {
        await controls.start({
          x: '-100%',
          transition: { 
            duration: adjustedDuration / parseFloat(speed), 
            ease: 'linear' 
          }
        });
        
        if (!isSubscribed) return;
        
        controls.set({ x: '100%' });
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      } catch (error) {
        // Animation was cancelled, do nothing
      }
    };

    animate();

    return () => {
      isSubscribed = false;
      controls.stop();
    };
  }, [controls, quotes, speed, currentQuoteIndex]);

  return (
    <div ref={containerRef} className="overflow-hidden bg-primary text-primary-foreground py-2 fixed top-0 left-0 right-0 z-50">
      <motion.div
        key={currentQuoteIndex} // キーを追加してQuoteが変わるたびに新しい要素として扱う
        animate={controls}
        initial={{ x: '100%' }}
        style={{ whiteSpace: 'nowrap', display: 'inline-block' }}
      >
        {quotes[currentQuoteIndex]}
      </motion.div>
    </div>
  )
}

