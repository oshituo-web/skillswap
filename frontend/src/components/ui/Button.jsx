const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', type = 'button', disabled = false, ...props }) => {
    let baseStyle = "inline-flex items-center justify-center px-4 py-2 font-semibold transition duration-150 ease-in-out rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantStyles = {
        default: "bg-indigo-600 text-white hover:bg-indigo-700",
        outline: "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-gray-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizeStyles = {
        default: "px-4 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-3 text-lg",
        icon: "p-2 rounded-full",
    };

    return (
        <button 
            className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} 
            onClick={onClick} 
            type={type} 
            disabled={disabled} 
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
