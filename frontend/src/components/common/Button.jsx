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
    "font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md";

  // Define variant styles
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    danger:
      "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700",
    success:
      "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  // Define size styles
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
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
