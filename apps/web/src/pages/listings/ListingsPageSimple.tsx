import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const ListingsPageSimple: React.FC = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log('Fetching listings...');
        const response = await fetch('/api/listings');
        console.log('Response:', response);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        console.log('Data:', data);
        
        setListings(data.data.listings || []);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Ett fel inträffade');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <>
      <Helmet>
        <title>Annonser - 123hansa.se</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Marknadsplats</h1>
          
          {loading && (
            <div className="text-center py-12">
              <p>Laddar annonser...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Fel: {error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <div className="grid gap-6">
              <p>Antal annonser: {listings.length}</p>
              {listings.map((listing: any) => (
                <div key={listing.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-bold">{listing.title}</h3>
                  <p className="text-gray-600">{listing.description}</p>
                  <p className="text-lg font-semibold mt-2">
                    {listing.askingPrice?.toLocaleString()} {listing.currency}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ListingsPageSimple;