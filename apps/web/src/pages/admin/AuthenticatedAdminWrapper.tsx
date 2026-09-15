import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedAdminPanel from './AdvancedAdminPanel';
import CustomerAdminPanel from './CustomerAdminPanel';

// Adminpanelen har ingen riktig inloggning förrän Supabase Auth finns och rollen
// kontrolleras på servern (docs/TODO.md, fas 3 och 4). Den tidigare inloggningen
// jämförde lösenord i klientkoden, vilket inte skyddar någonting. App.tsx bygger
// därför bara in den här sidan i utvecklingsläge, och här väljer man vy direkt.

type View = { type: 'admin' } | { type: 'customer'; customerId: string };

// Kund-id:n som mockdatan i AdvancedAdminPanel och CustomerAdminPanel använder.
const MOCK_CUSTOMERS = [
  { id: '1', name: 'Anna Karlsson' },
  { id: '2', name: 'Erik Johansson' },
  { id: '3', name: 'Maria Svensson' },
];

const AuthenticatedAdminWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>({ type: 'admin' });

  const leave = () => navigate('/');

  return (
    <div>
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-sm text-amber-900 flex flex-wrap items-center gap-3">
        <span className="font-semibold">Utvecklingsläge</span>
        <span>Mockdata, ingen inloggning. Sidan finns inte i produktionsbygget.</span>
        <label className="flex items-center gap-2 ml-auto">
          <span>Vy:</span>
          <select
            className="rounded border-amber-300 bg-white py-1 text-sm"
            value={view.type === 'admin' ? 'admin' : view.customerId}
            onChange={(e) =>
              setView(
                e.target.value === 'admin'
                  ? { type: 'admin' }
                  : { type: 'customer', customerId: e.target.value }
              )
            }
          >
            <option value="admin">Administratör</option>
            {MOCK_CUSTOMERS.map((c) => (
              <option key={c.id} value={c.id}>
                Kund: {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {view.type === 'admin' ? (
        <AdvancedAdminPanel onLogout={leave} />
      ) : (
        <CustomerAdminPanel customerId={view.customerId} onLogout={leave} />
      )}
    </div>
  );
};

export default AuthenticatedAdminWrapper;
