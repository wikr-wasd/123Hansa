import React from 'react';

const SentryTest: React.FC = () => {
  const handleTestError = () => {
    throw new Error("This is your first error!");
  };

  return (
    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Sentry Test</h3>
      <p className="text-red-700 mb-4">Click the button below to test Sentry error reporting:</p>
      <button
        onClick={handleTestError}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Break the world
      </button>
    </div>
  );
};

export default SentryTest;