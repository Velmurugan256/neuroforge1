// --- FILE: components/ui/IconButton.jsx ---
import React from "react";
import PropTypes from "prop-types";

const variantClasses = {
  default: "bg-gray-800 hover:bg-gray-700 text-white",
  danger: "bg-transparent hover:bg-red-600 text-white",
  ghost: "bg-transparent hover:bg-gray-700 text-white",
};

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

const IconButton = ({
  icon: Icon,
  onClick,
  title = "",
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        inline-flex items-center justify-center
        border border-transparent rounded
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...props}
    >
      {typeof Icon === "string" ? Icon : <Icon className="w-4 h-4" />}
    </button>
  );
};

IconButton.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]).isRequired,
  onClick: PropTypes.func,
  title: PropTypes.string,
  variant: PropTypes.oneOf(["default", "danger", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default IconButton;
