import React, { useState } from 'react';

interface PopoverProps {
  children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { open, setOpen } as any)
          : child
      )}
    </div>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ 
  children, 
  open, 
  setOpen 
}) => {
  return (
    <div onClick={() => setOpen?.(!open)}>
      {children}
    </div>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  open, 
  setOpen,
  className = '' 
}) => {
  if (!open) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={() => setOpen?.(false)}
      />
      <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50 p-4 ${className}`}>
        {children}
      </div>
    </>
  );
};