import React from 'react';
import { CatalogProvider } from '../../features/catalogs/CatalogContext';
import { AdditionalCatalogsManager } from '../../features/catalogs/AdditionalCatalogsManager';

export default function CatalogsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Catálogos</h1>
      <CatalogProvider>
        <AdditionalCatalogsManager />
      </CatalogProvider>
    </div>
  );
}
