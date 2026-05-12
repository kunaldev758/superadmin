import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientListView from './ClientListView';
import ClientDetailsView from './ClientDetailsView';

const ClientManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedClientId, setSelectedClientId] = useState(null);
  /** Bumped when leaving client details so the list refetches (it stays mounted hidden while on details). */
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleViewDetails = (clientId) => {
    setSelectedClientId(clientId);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedClientId(null);
    setListRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Keep list mounted while viewing details so pagination, page size, sort, and search persist */}
      <div className={currentView === 'list' ? 'block' : 'hidden'} aria-hidden={currentView !== 'list'}>
        <ClientListView onViewDetails={handleViewDetails} listRefreshKey={listRefreshKey} />
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