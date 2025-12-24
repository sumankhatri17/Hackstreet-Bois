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
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}) => {
  // Define base styles
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md hover:shadow-xl";

  // Define variant styles
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
    secondary:
      "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-purple-600 hover:text-purple-600",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
    success:
      "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  // Define size styles
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
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
