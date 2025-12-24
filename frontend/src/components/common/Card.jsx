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
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${
        paddingStyles[padding]
      } ${className} ${
        hoverable
          ? "hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
          : ""
      }`}
    >
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
