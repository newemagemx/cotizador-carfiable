
import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.header
      className="w-full flex justify-center items-center mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="h-16 flex items-center">
        <img 
          src="https://carfiable.mx/wp-content/uploads/2023/10/Asset-1.png" 
          alt="Carfiable Logo" 
          className="h-12 md:h-16"
        />
      </div>
    </motion.header>
  );
};

export default Header;
