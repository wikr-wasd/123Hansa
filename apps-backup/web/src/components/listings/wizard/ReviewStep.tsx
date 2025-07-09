import React from 'react';
import { ListingFormData } from '../CreateListingWizard';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

interface ReviewStepProps {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onPrev: () => void;
  onSubmit: (publish: boolean) => void;
  isLoading: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  BUSINESS: 'Företag',
  ECOMMERCE: 'E-handel',
  SAAS: 'SaaS',
  WEBSITE: 'Webbsida',
  DOMAIN: 'Domän',
  INVOICE: 'Faktura',
  REAL_ESTATE: 'Fastighet',
  EQUIPMENT: 'Utrustning',
  OTHER: 'Annat',
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  AB: 'Aktiebolag (AB)',
  AS: 'Aksjeselskap (AS)',
  A_S: 'Aktieselskab (A/S)',
  SOLE_PROP: 'Enskild firma',
  PARTNER: 'Handelsbolag',
  OTHER: 'Annat',
};

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onPrev, onSubmit, isLoading }) => {
  const formatNumber = (num: number | undefined) => {
    if (!num) return 'Ej angivet';
    return new Intl.NumberFormat('sv-SE').format(num);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('text')) return '📄';
    return '📁';
  };

  const handleSaveDraft = () => {
    onSubmit(false);
  };

  const handlePublish = () => {
    onSubmit(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
          Granska och publicera
        </h2>
        <p className="text-nordic-gray-600">
          Kontrollera all information innan du publicerar eller sparar som utkast.
        </p>
      </div>

      {/* Basic Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-nordic-gray-900">Grundläggande information</h3>
        </div>
        <div className="card-body space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-nordic-gray-600">Titel</label>
              <p className="text-nordic-gray-900">{data.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-nordic-gray-600">Kategori</label>
              <p className="text-nordic-gray-900">
                {CATEGORY_LABELS[data.category]}
                {data.subcategory && ` - ${data.subcategory}`}
              </p>
            </div>
          </div>
          
          {data.shortDescription && (
            <div>
              <label className="text-sm font-medium text-nordic-gray-600">Kort beskrivning</label>
              <p className="text-nordic-gray-900">{data.shortDescription}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-nordic-gray-600">Beskrivning</label>
            <p className="text-nordic-gray-900 whitespace-pre-wrap">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-nordic-gray-900">Företagsdetaljer</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.businessType && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Företagsform</label>
                <p className="text-nordic-gray-900">{BUSINESS_TYPE_LABELS[data.businessType]}</p>
              </div>
            )}
            
            {data.location && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Plats</label>
                <p className="text-nordic-gray-900">
                  {data.location}
                  {data.isRemote && ' (kan bedrivas på distans)'}
                </p>
              </div>
            )}
            
            {data.establishedYear && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Etablerat år</label>
                <p className="text-nordic-gray-900">{data.establishedYear}</p>
              </div>
            )}
            
            {data.website && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Webbsida</label>
                <p className="text-nordic-gray-900">
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-nordic-blue-600 hover:text-nordic-blue-700"
                  >
                    {data.website}
                  </a>
                </p>
              </div>
            )}
          </div>
          
          {data.reasonForSale && (
            <div className="mt-4">
              <label className="text-sm font-medium text-nordic-gray-600">Anledning till försäljning</label>
              <p className="text-nordic-gray-900">{data.reasonForSale}</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-nordic-gray-900">Finansiell information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.askingPrice && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Utropspris</label>
                <p className="text-nordic-gray-900 font-semibold">
                  {formatNumber(data.askingPrice)} {data.currency}
                  {data.isNegotiable && (
                    <span className="ml-2 text-sm font-normal text-nordic-gray-500">
                      (förhandlingsbart)
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {data.monthlyRevenue && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Månadsomsättning</label>
                <p className="text-nordic-gray-900">{formatNumber(data.monthlyRevenue)} {data.currency}</p>
              </div>
            )}
            
            {data.monthlyProfit && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Månadsvinst</label>
                <p className="text-nordic-gray-900">{formatNumber(data.monthlyProfit)} {data.currency}</p>
              </div>
            )}
            
            {data.employees !== undefined && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600">Antal anställda</label>
                <p className="text-nordic-gray-900">
                  {data.employees === 0 ? 'Endast grundare' : `${data.employees} anställda`}
                </p>
              </div>
            )}
          </div>
          
          {data.includedAssets.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-nordic-gray-600">Vad som ingår</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.includedAssets.map(asset => (
                  <span 
                    key={asset}
                    className="px-2 py-1 bg-nordic-blue-100 text-nordic-blue-800 text-xs rounded-full"
                  >
                    {asset}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media */}
      {((data.images && data.images.length > 0) || (data.documents && data.documents.length > 0)) && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-nordic-gray-900">Bilder och dokument</h3>
          </div>
          <div className="card-body space-y-4">
            {data.images && data.images.length > 0 && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600 mb-2 block">
                  Bilder ({data.images.length})
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {data.images.map((file, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Bild ${index + 1}`}
                        className="w-full h-full object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {data.documents && data.documents.length > 0 && (
              <div>
                <label className="text-sm font-medium text-nordic-gray-600 mb-2 block">
                  Dokument ({data.documents.length})
                </label>
                <div className="space-y-2">
                  {data.documents.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 border border-nordic-gray-200 rounded p-2">
                      <span className="text-xl">{getFileIcon(file.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-nordic-gray-900">{file.name}</p>
                        <p className="text-xs text-nordic-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publication Note */}
      <div className="bg-nordic-yellow-50 border border-nordic-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-nordic-yellow-600 text-xl">ℹ️</div>
          <div>
            <h4 className="font-medium text-nordic-yellow-800">Om publicering</h4>
            <p className="text-sm text-nordic-yellow-700 mt-1">
              När du publicerar din annons kommer den att granskas av vårt team innan den blir synlig för köpare. 
              Du kan också spara som utkast och publicera senare.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-nordic-gray-200">
        <button
          type="button"
          onClick={onPrev}
          disabled={isLoading}
          className="px-6 py-2 border border-nordic-gray-300 text-nordic-gray-700 rounded-lg hover:bg-nordic-gray-50 transition-colors disabled:opacity-50"
        >
          ← Tillbaka
        </button>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="px-6 py-2 border border-nordic-gray-300 text-nordic-gray-700 rounded-lg hover:bg-nordic-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Spara som utkast'}
          </button>
          
          <button
            type="button"
            onClick={handlePublish}
            disabled={isLoading}
            className="px-6 py-2 bg-nordic-blue-600 text-white rounded-lg hover:bg-nordic-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : null}
            <span>Publicera annons</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;