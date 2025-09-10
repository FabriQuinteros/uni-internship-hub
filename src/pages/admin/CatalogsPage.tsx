import React, { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Code2, Brain, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import CatalogTable from "@/components/admin/CatalogManagement/CatalogTable";
import CatalogModal from "@/components/admin/CatalogManagement/CatalogModal";
import { Technology, Skill, CatalogType } from "@/types/catalog";
import { useToast } from "@/components/ui/use-toast";
import { useCatalogStore } from "@/store/catalogStore";
import { TECHNOLOGY_CATEGORIES, SKILL_LEVELS } from "@/data/mockCatalogData";

const CatalogsContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Technology | Skill | undefined>();
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>("technology");
  const { toast } = useToast();
  const { addItem, updateItem, deleteItem, getItems } = useCatalogStore();

  const handleEdit = (item: Technology | Skill) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    (item: Technology | Skill) => {
      deleteItem(activeCatalog, item.id);
      toast({
        title: "Elemento eliminado",
        description: `${item.name} ha sido eliminado del catálogo.`,
      });
    },
    [activeCatalog, deleteItem, toast]
  );

  const handleSubmit = (data: any) => {
    const newData = {
      ...data,
      status: selectedItem?.status || 'active',
      createdAt: selectedItem?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (selectedItem) {
      updateItem(activeCatalog, selectedItem.id, newData);
      toast({
        title: "Elemento actualizado",
        description: `${data.name} ha sido actualizado exitosamente.`,
      });
    } else {
      addItem(activeCatalog, {
        ...newData,
        id: Date.now().toString(),
      });
      toast({
        title: "Elemento agregado",
        description: `${data.name} ha sido agregado al catálogo.`,
      });
    }
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  const items = getItems(activeCatalog);
  const activeItems = items.filter(item => item.status === 'active').length;
  const totalItems = items.length;
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Catálogos</h1>
          <p className="text-muted-foreground">
            Administra las tecnologías y habilidades del sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {activeItems} activos / {totalItems} total
            </span>
          </div>
          <Button
            onClick={() => {
              setSelectedItem(undefined);
              setIsModalOpen(true);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Database className="mr-2 h-4 w-4" />
            Agregar Nuevo
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="technology"
        className="space-y-6"
        onValueChange={(value) => setActiveCatalog(value as CatalogType)}
      >
        <TabsList>
          <TabsTrigger value="technology" className="flex items-center space-x-2">
            <Code2 className="h-4 w-4" />
            <span>Tecnologías</span>
          </TabsTrigger>
          <TabsTrigger value="skill" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Habilidades</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tecnologías</CardTitle>
              <CardDescription>
                Gestiona las tecnologías disponibles para las pasantías
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CatalogTable
                type="technology"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skill" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Habilidades</CardTitle>
              <CardDescription>
                Gestiona las habilidades requeridas para las pasantías
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CatalogTable
                type="skill"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <CatalogModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          type={activeCatalog}
          item={selectedItem}
        />
      )}
    </div>
  );
};

const CatalogsPage = () => (
  <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <CatalogsContent />
  </div>
);

export default CatalogsPage;
