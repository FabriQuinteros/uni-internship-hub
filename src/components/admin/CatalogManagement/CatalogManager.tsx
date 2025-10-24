import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

import CatalogList from './CatalogList';
import CatalogForm from './CatalogForm';
import { CatalogType, CatalogItem, CreateCatalogRequest, UpdateCatalogRequest } from '@/types/catalog';
import { useCatalogStore } from '@/store/unifiedCatalogStore';
import { getCatalogConfig, getAllCatalogTypes } from '@/utils/catalogConfig';

const CatalogManager: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  
  const { toast } = useToast();

  // Store hooks
  const selectedCatalogType = useCatalogStore(state => state.selectedCatalogType);
  const setSelectedCatalogType = useCatalogStore(state => state.setSelectedCatalogType);
  const loadingState = useCatalogStore(state => state.loadingState);
  const loadCatalog = useCatalogStore(state => state.loadCatalog);
  const createItem = useCatalogStore(state => state.createItem);
  const updateItem = useCatalogStore(state => state.updateItem);
  const clearError = useCatalogStore(state => state.clearError);

  const catalogTypes = getAllCatalogTypes();

  // Load initial catalog when component mounts or catalog type changes
  useEffect(() => {
    loadCatalog(selectedCatalogType).catch(() => {
      // Error is handled by the store and displayed in the UI
    });
  }, [selectedCatalogType, loadCatalog]);

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (data: CreateCatalogRequest | UpdateCatalogRequest) => {
    try {
      if (editingItem) {
        // Update existing item
        await updateItem(selectedCatalogType, editingItem.id, data as UpdateCatalogRequest);
        toast({
          title: 'Éxito',
          description: `${getCatalogConfig(selectedCatalogType).singularLabel} actualizado correctamente`,
        });
      } else {
        // Create new item
        await createItem(selectedCatalogType, data as CreateCatalogRequest);
        toast({
          title: 'Éxito',
          description: `${getCatalogConfig(selectedCatalogType).singularLabel} creado correctamente`,
        });
      }
      
      handleFormClose();
    } catch (error) {
      // Error is handled by the store, just show toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Operación fallida',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    clearError();
    loadCatalog(selectedCatalogType).catch(() => {
      // Error is handled by the store
    });
  };

  const handleTabChange = (value: string) => {
    const newType = value as CatalogType;
    setSelectedCatalogType(newType);
    // Close any open forms when switching tabs
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Catálogos</h1>
          <p className="text-muted-foreground">
            Gestiona tecnologías, puestos, duraciones, ubicaciones y modalidades disponibles en la plataforma.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loadingState.isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingState.isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error Alert */}
      {loadingState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{loadingState.error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearError}
              className="ml-4"
            >
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Catalog Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={selectedCatalogType} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-6">
              {catalogTypes.map((type) => {
                const config = getCatalogConfig(type);
                return (
                  <TabsTrigger key={type} value={type} className="text-sm">
                    {config.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {catalogTypes.map((type) => (
              <TabsContent key={type} value={type} className="mt-6">
                <CatalogList
                  type={type}
                  onEdit={handleEdit}
                  onCreateNew={handleCreateNew}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <CatalogForm
        type={selectedCatalogType}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editItem={editingItem}
        isLoading={loadingState.isLoading}
      />
    </div>
  );
};

export default CatalogManager;