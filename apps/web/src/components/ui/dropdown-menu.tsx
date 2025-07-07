import React, { useState } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
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

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
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

interface DropdownMenuContentProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
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
      <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 ${className}`}>
        {children}
      </div>
    </>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  onClick,
  className = '' 
}) => {
  return (
    <div 
      className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </div>
  );
};

interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`h-px bg-gray-200 my-1 ${className}`} />
  );
};