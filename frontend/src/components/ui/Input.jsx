const Input = ({ id, type, value, onChange, placeholder, disabled, className = '', required = false, ...props }) => {
    const baseStyle = "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900 dark:placeholder:text-gray-400 dark:focus-visible:ring-indigo-400";
    return <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} className={`${baseStyle} ${className}`} required={required} {...props} />;
};

export default Input;
