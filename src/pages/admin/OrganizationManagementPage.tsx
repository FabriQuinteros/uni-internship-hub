import React from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import OrganizationManagementPanel from '../../components/admin/OrganizationManagementPanel';
import { withAdminPermission } from '../../hooks/use-admin-permissions';

const OrganizationManagementPage: React.FC = () => {
  return (
      <OrganizationManagementPanel />
  );
};

// Proteger la página con permisos de administrador
export default withAdminPermission(OrganizationManagementPage, 'canManageOrganizations');