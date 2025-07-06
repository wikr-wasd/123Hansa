import React, { useState } from 'react';
import { ClaudeChat } from './ClaudeChat';

export const ClaudeChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <ClaudeChat 
        isMinimized={true} 
        onToggleMinimize={handleToggle}
      />
    );
  }

  return (
    <ClaudeChat 
      isMinimized={isMinimized}
      onToggleMinimize={handleMinimize}
      onClose={handleClose}
    />
  );
};