import React, { useRef, useState } from 'react';
import { ListingFormData } from '../CreateListingWizard';

interface MediaUploadStepProps {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MediaUploadStep: React.FC<MediaUploadStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB max
    );
    
    const currentImages = data.images || [];
    const newImages = [...currentImages, ...imageFiles];
    
    // Limit to 10 images
    if (newImages.length > 10) {
      newImages.splice(10);
    }
    
    updateData({ images: newImages });
  };

  const handleDocumentUpload = (files: FileList | null) => {
    if (!files) return;
    
    const documentFiles = Array.from(files).filter(file => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ];
      return allowedTypes.includes(file.type) && file.size <= 25 * 1024 * 1024; // 25MB max
    });
    
    const currentDocuments = data.documents || [];
    const newDocuments = [...currentDocuments, ...documentFiles];
    
    // Limit to 5 documents
    if (newDocuments.length > 5) {
      newDocuments.splice(5);
    }
    
    updateData({ documents: newDocuments });
  };

  const removeImage = (index: number) => {
    const images = data.images || [];
    const newImages = images.filter((_, i) => i !== index);
    updateData({ images: newImages });
  };

  const removeDocument = (index: number) => {
    const documents = data.documents || [];
    const newDocuments = documents.filter((_, i) => i !== index);
    updateData({ documents: newDocuments });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'images' | 'documents') => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (type === 'images') {
      handleImageUpload(files);
    } else {
      handleDocumentUpload(files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
          Bilder och dokument
        </h2>
        <p className="text-nordic-gray-600">
          Ladda upp bilder och dokument som kan hjälpa köpare att förstå värdet av ditt företag.
        </p>
      </div>

      {/* Images Section */}
      <div>
        <h3 className="text-lg font-medium text-nordic-gray-900 mb-3">
          Bilder ({data.images?.length || 0}/10)
        </h3>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-nordic-blue-500 bg-nordic-blue-50' 
              : 'border-nordic-gray-300 hover:border-nordic-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'images')}
        >
          <div className="space-y-2">
            <div className="text-4xl">📸</div>
            <div>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="text-nordic-blue-600 hover:text-nordic-blue-700 font-medium"
              >
                Klicka för att ladda upp bilder
              </button>
              <span className="text-nordic-gray-500"> eller dra och släpp dem här</span>
            </div>
            <p className="text-xs text-nordic-gray-500">
              PNG, JPG, WebP, GIF upp till 10MB vardera. Max 10 bilder.
            </p>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
        />

        {/* Image Preview */}
        {data.images && data.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {data.images.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-nordic-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
                <div className="mt-1 text-xs text-nordic-gray-500 truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div>
        <h3 className="text-lg font-medium text-nordic-gray-900 mb-3">
          Dokument ({data.documents?.length || 0}/5)
        </h3>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-nordic-blue-500 bg-nordic-blue-50' 
              : 'border-nordic-gray-300 hover:border-nordic-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'documents')}
        >
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <div>
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                className="text-nordic-blue-600 hover:text-nordic-blue-700 font-medium"
              >
                Klicka för att ladda upp dokument
              </button>
              <span className="text-nordic-gray-500"> eller dra och släpp dem här</span>
            </div>
            <p className="text-xs text-nordic-gray-500">
              PDF, DOC, DOCX, XLS, XLSX, TXT, CSV upp till 25MB vardera. Max 5 dokument.
            </p>
          </div>
        </div>

        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          multiple
          onChange={(e) => handleDocumentUpload(e.target.files)}
          className="hidden"
        />

        {/* Document List */}
        {data.documents && data.documents.length > 0 && (
          <div className="space-y-2 mt-4">
            {data.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between border border-nordic-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div>
                    <div className="font-medium text-nordic-gray-900 truncate max-w-[200px]">
                      {file.name}
                    </div>
                    <div className="text-sm text-nordic-gray-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-nordic-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-nordic-blue-900 mb-2">💡 Tips för bättre resultat</h4>
        <ul className="text-sm text-nordic-blue-800 space-y-1">
          <li>• Lägg till professionella bilder av produkter, lokaler eller team</li>
          <li>• Inkludera finansiella rapporter eller sammanfattningar</li>
          <li>• Ladda upp företagspresentationer eller affärsplaner</li>
          <li>• Bilder av teknik, utrustning eller inventarier som ingår</li>
          <li>• Kundavtal eller referenser som visar stabilitet</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-nordic-gray-200">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 border border-nordic-gray-300 text-nordic-gray-700 rounded-lg hover:bg-nordic-gray-50 transition-colors"
        >
          ← Tillbaka
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-nordic-blue-600 text-white rounded-lg hover:bg-nordic-blue-700 transition-colors"
        >
          Fortsätt →
        </button>
      </div>
    </form>
  );
};

export default MediaUploadStep;