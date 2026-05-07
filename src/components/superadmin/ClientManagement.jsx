import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientListView from './ClientListView';
import ClientDetailsView from './ClientDetailsView';

const ClientManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedClientId, setSelectedClientId] = useState(null);

  const handleViewDetails = (clientId) => {
    setSelectedClientId(clientId);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedClientId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Keep list mounted while viewing details so pagination, page size, sort, and search persist */}
      <div className={currentView === 'list' ? 'block' : 'hidden'} aria-hidden={currentView !== 'list'}>
        <ClientListView onViewDetails={handleViewDetails} />
      </div>
      {currentView === 'details' && (
        <ClientDetailsView
          clientId={selectedClientId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default ClientManagement;