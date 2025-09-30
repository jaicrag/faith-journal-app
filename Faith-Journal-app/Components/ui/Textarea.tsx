
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
  const textareaId = id || props.name;
  return (
    <div>
      <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <textarea
        id={textareaId}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        {...props}
      />
    </div>
  );
};

export default Textarea;
