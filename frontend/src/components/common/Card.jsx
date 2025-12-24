/**
 * Reusable Card Component
 *
 * Props:
 * - children: Card content
 * - title: Optional card title
 * - className: Additional CSS classes
 * - padding: 'sm' | 'md' | 'lg'
 *
 * Usage:
 * <Card title="Dashboard">
 *   <p>Card content here</p>
 * </Card>
 */

const Card = ({
  children,
  title,
  className = "",
  padding = "md",
  hoverable = false,
}) => {
  const paddingStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${
        paddingStyles[padding]
      } ${className} ${
        hoverable
          ? "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          : ""
      }`}
    >
      {title && (
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
