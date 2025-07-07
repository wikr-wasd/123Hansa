import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HeartContract } from '../../components/heart/HeartContract';

const HeartPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Heart Avtalsstöd - Säkra Digitala Avtal</title>
        <meta name="description" content="Heart erbjuder säker digital signering och escrow-tjänster för alla dina affärstransaktioner på 123Hansa." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeartContract />
        </div>
      </div>
    </>
  );
};

export default HeartPage;