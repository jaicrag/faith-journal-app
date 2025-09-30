
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  const selectId = id || props.name;
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <select
        id={selectId}
        className="w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
