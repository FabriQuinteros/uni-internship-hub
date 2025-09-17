import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table"; // Ajusta la ruta si es necesario

type Organization = {
  id: number;
  name: string;
  email: string;
  status: "pendiente" | "habilitada" | "rechazada" | "suspendida";
};

const statusOptions = [
  "pendiente",
  "habilitada",
  "rechazada",
  "suspendida",
] as const;

const OrganizationApprovalPanel: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch("/api/organizations"); // Cambia la URL según tu backend
        const data = await res.json();
        setOrganizations(data);
      } catch (error) {
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  const handleStatusChange = async (id: number, newStatus: Organization["status"]) => {
    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === id ? { ...org, status: newStatus } : org
      )
    );
    try {
      await fetch(`/api/organizations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Organizaciones</h2>
      <p className="mb-6 text-gray-600">Administra las cuentas de las organizaciones.</p>
      {loading ? (
        <div className="text-center text-gray-500">Cargando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-semibold">Nombre</TableCell>
              <TableCell className="font-semibold">Correo</TableCell>
              <TableCell className="font-semibold">Estado</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow
                key={org.id}
                className={
                  org.status === "habilitada"
                    ? "bg-green-50"
                    : org.status === "pendiente"
                    ? "bg-yellow-50"
                    : org.status === "rechazada"
                    ? "bg-red-50"
                    : "bg-gray-50"
                }
              >
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.email}</TableCell>
                <TableCell>
                  <select
                    className="border rounded px-2 py-1 bg-transparent"
                    value={org.status}
                    onChange={(e) =>
                      handleStatusChange(
                        org.id,
                        e.target.value as Organization["status"]
                      )
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default OrganizationApprovalPanel;