import React from 'react';
import { motion } from 'framer-motion';

const AnimatedLogo = ({ className = "" }) => {
  const pathD = "M 50 15 L 75 28 L 65 44 L 50 35 L 35 44 L 25 28 Z";

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: -60, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 12, stiffness: 80 }
    }
  };

  const textVariants = {
      hidden: { opacity: 0, scale: 0.9, y: 10 },
      visible: {
          opacity: 1, scale: 1, y: 0,
          transition: { delay: 0.8, duration: 0.6, ease: 'easeOut' }
      }
  };

  return (
    <div className={`flex flex-col items-center w-full h-full justify-center ${className}`}>
        <motion.svg 
            width="100" 
            height="100" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="mb-2 w-24 h-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ overflow: 'visible' }}
        >
            <g>
                <motion.path 
                d={pathD} 
                fill="#F47C20" 
                variants={itemVariants}
                />
            </g>
            <g transform="rotate(120 50 50)">
                <motion.path 
                d={pathD} 
                fill="#8DC63F" 
                variants={itemVariants}
                />
            </g>
            <g transform="rotate(240 50 50)">
                <motion.path 
                d={pathD} 
                fill="#9C2A8C" 
                variants={itemVariants}
                />
            </g>
        </motion.svg>

        <motion.div 
            className="text-center w-full mt-2"
            variants={textVariants}
            initial="hidden"
            animate="visible"
        >
            <h1 className="text-3xl font-extrabold tracking-widest text-[#212121] mb-1">VISHNU</h1>
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#212121]">UNIVERSAL LEARNING</p>
        </motion.div>
    </div>
  );
};

export default AnimatedLogo;
