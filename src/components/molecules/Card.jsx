import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = `
    bg-white 
    rounded-lg 
    shadow-sm 
    border 
    border-gray-200 
    ${padding}
    ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

// Export as both named and default for flexibility
export { Card };
export default Card;