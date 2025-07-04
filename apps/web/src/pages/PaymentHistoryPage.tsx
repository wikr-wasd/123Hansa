import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../stores/authStore';
import { paymentService, Payment } from '../services/paymentService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface PaymentFilters {
  status: string;
  paymentMethod: string;
  currency: string;
  dateRange: string;
}

const PaymentHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    paymentMethod: 'all',
    currency: 'all',
    dateRange: 'all',
  });

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (user) {
      loadPayments(true);
    }
  }, [user, filters]);

  const loadPayments = async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setCurrentPage(0);
      setPayments([]);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const offset = reset ? 0 : currentPage * ITEMS_PER_PAGE;
      const result = await paymentService.getUserPayments(ITEMS_PER_PAGE, offset);
      
      const filteredPayments = applyFilters(result.data.payments);
      
      if (reset) {
        setPayments(filteredPayments);
      } else {
        setPayments(prev => [...prev, ...filteredPayments]);
      }
      
      setHasMore(result.data.pagination.hasMore);
      setCurrentPage(prev => reset ? 1 : prev + 1);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const applyFilters = (paymentList: Payment[]): Payment[] => {
    return paymentList.filter(payment => {
      // Status filter
      if (filters.status !== 'all' && payment.status !== filters.status) {
        return false;
      }

      // Payment method filter
      if (filters.paymentMethod !== 'all' && payment.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Currency filter
      if (filters.currency !== 'all' && payment.currency !== filters.currency) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const paymentDate = new Date(payment.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case '3months':
            return diffDays <= 90;
          case 'year':
            return diffDays <= 365;
          default:
            return true;
        }
      }

      return true;
    });
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatPaymentDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: sv });
  };

  const getPaymentStatusBadge = (status: string) => {
    const color = paymentService.getPaymentStatusColor(status);
    const text = paymentService.getPaymentStatusText(status);
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}>
        {text}
      </span>
    );
  };

  const getUniqueValues = (key: keyof Payment) => {
    const values = [...new Set(payments.map(payment => payment[key]))];
    return values.filter(value => value != null);
  };

  if (!user) {
    return <div>Du måste vara inloggad för att se betalningshistorik</div>;
  }

  return (
    <>
      <Helmet>
        <title>Betalningshistorik - Tubba</title>
        <meta name="description" content="Se din betalningshistorik och transaktioner på Tubba" />
      </Helmet>

      <div className="min-h-screen bg-nordic-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-nordic-gray-900">
              Betalningshistorik
            </h1>
            <p className="mt-2 text-nordic-gray-600">
              Översikt över alla dina betalningar och transaktioner
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-nordic-gray-900 mb-4">Filter</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="all">Alla statusar</option>
                  <option value="SUCCEEDED">Genomförda</option>
                  <option value="PENDING">Väntar</option>
                  <option value="FAILED">Misslyckade</option>
                  <option value="CANCELLED">Avbrutna</option>
                  <option value="REFUNDED">Återbetalda</option>
                </select>
              </div>

              {/* Payment method filter */}
              <div>
                <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                  Betalningsmetod
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="input-field"
                >
                  <option value="all">Alla metoder</option>
                  <option value="STRIPE_CARD">Kort</option>
                  <option value="SWISH">Swish</option>
                  <option value="MOBILEPAY">MobilePay</option>
                  <option value="VIPPS">Vipps</option>
                  <option value="STRIPE_SEPA">SEPA</option>
                </select>
              </div>

              {/* Currency filter */}
              <div>
                <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                  Valuta
                </label>
                <select
                  value={filters.currency}
                  onChange={(e) => handleFilterChange('currency', e.target.value)}
                  className="input-field"
                >
                  <option value="all">Alla valutor</option>
                  <option value="SEK">SEK</option>
                  <option value="NOK">NOK</option>
                  <option value="DKK">DKK</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              {/* Date range filter */}
              <div>
                <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
                  Tidsperiod
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="input-field"
                >
                  <option value="all">Alla datum</option>
                  <option value="week">Senaste veckan</option>
                  <option value="month">Senaste månaden</option>
                  <option value="3months">Senaste 3 månaderna</option>
                  <option value="year">Senaste året</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payments list */}
          <div className="bg-white rounded-lg shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-nordic-gray-600">Laddar betalningar...</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-nordic-gray-400 mb-4">💳</div>
                <h3 className="text-lg font-medium text-nordic-gray-900 mb-2">
                  Inga betalningar hittades
                </h3>
                <p className="text-nordic-gray-600">
                  Inga betalningar matchar dina valda filter.
                </p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="px-6 py-4 border-b border-nordic-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-nordic-gray-700">
                    <div className="col-span-3">Betalning</div>
                    <div className="col-span-2">Belopp</div>
                    <div className="col-span-2">Metod</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Datum</div>
                  </div>
                </div>

                {/* Payment rows */}
                <div className="divide-y divide-nordic-gray-200">
                  {payments.map((payment, index) => (
                    <div key={payment.id} className="px-6 py-4 hover:bg-nordic-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Payment info */}
                        <div className="col-span-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {paymentService.getPaymentMethodIcon(payment.paymentMethod)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-nordic-gray-900">
                                #{payment.id.slice(-8)}
                              </p>
                              {payment.metadata?.description && (
                                <p className="text-xs text-nordic-gray-600 truncate max-w-32">
                                  {payment.metadata.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="col-span-2">
                          <p className="text-sm font-semibold text-nordic-gray-900">
                            {paymentService.formatCurrency(payment.amount, payment.currency)}
                          </p>
                          {payment.feeAmount > 0 && (
                            <p className="text-xs text-nordic-gray-500">
                              Avgift: {paymentService.formatCurrency(payment.feeAmount, payment.currency)}
                            </p>
                          )}
                        </div>

                        {/* Payment method */}
                        <div className="col-span-2">
                          <p className="text-sm text-nordic-gray-900">
                            {payment.paymentMethod === 'STRIPE_CARD' ? 'Kort' :
                             payment.paymentMethod === 'SWISH' ? 'Swish' :
                             payment.paymentMethod === 'MOBILEPAY' ? 'MobilePay' :
                             payment.paymentMethod === 'VIPPS' ? 'Vipps' :
                             payment.paymentMethod}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          {getPaymentStatusBadge(payment.status)}
                        </div>

                        {/* Date */}
                        <div className="col-span-3">
                          <p className="text-sm text-nordic-gray-900">
                            {formatPaymentDate(payment.createdAt)}
                          </p>
                          <p className="text-xs text-nordic-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString('sv-SE')}
                          </p>
                        </div>
                      </div>

                      {/* Failure reason */}
                      {payment.failureReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <span className="font-medium">Felorsak:</span> {payment.failureReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Load more button */}
                {hasMore && (
                  <div className="px-6 py-4 border-t border-nordic-gray-200">
                    <button
                      onClick={() => loadPayments(false)}
                      disabled={isLoadingMore}
                      className="w-full py-2 px-4 text-nordic-blue-600 hover:text-nordic-blue-700 font-medium transition-colors"
                    >
                      {isLoadingMore ? (
                        <div className="flex items-center justify-center space-x-2">
                          <LoadingSpinner size="sm" />
                          <span>Laddar fler...</span>
                        </div>
                      ) : (
                        'Ladda fler betalningar'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Summary statistics */}
          {payments.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-nordic-gray-900 mb-2">
                  Totalt antal betalningar
                </h3>
                <p className="text-3xl font-bold text-nordic-blue-600">
                  {payments.length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-nordic-gray-900 mb-2">
                  Genomförda betalningar
                </h3>
                <p className="text-3xl font-bold text-nordic-green-600">
                  {payments.filter(p => p.status === 'SUCCEEDED').length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-nordic-gray-900 mb-2">
                  Totalt belopp (SEK)
                </h3>
                <p className="text-3xl font-bold text-nordic-gray-900">
                  {paymentService.formatCurrency(
                    payments
                      .filter(p => p.status === 'SUCCEEDED' && p.currency === 'SEK')
                      .reduce((sum, p) => sum + p.amount, 0),
                    'SEK'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentHistoryPage;