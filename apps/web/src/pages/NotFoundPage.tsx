import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nordic-gray-900 mb-4">404</h1>
        <p className="text-lg text-nordic-gray-600 mb-8">Sidan kunde inte hittas</p>
        <a href="/" className="btn btn-primary">
          Tillbaka till startsidan
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;