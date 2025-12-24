/**
 * Reusable Button Component
 * 
 * Props:
 * - children: Button text/content
 * - variant: 'primary' | 'secondary' | 'outline' | 'danger'
 * - size: 'sm' | 'md' | 'lg'
 * - onClick: Click handler function
 * - disabled: Boolean to disable button
 * - className: Additional CSS classes
 * 
 * Usage:
 * <Button variant="primary" onClick={handleClick}>Click Me</Button>
 */

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick, 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  // Define base styles
  const baseStyles = 'font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Define variant styles
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  // Define size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;