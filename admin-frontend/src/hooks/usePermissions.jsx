import { usePermissions as usePermissionsRA } from 'react-admin';

const usePermissions = () => {
  const { permissions } = usePermissionsRA();
  return { isSuperAdmin: permissions === 'SUPERADMIN' };
};

export default usePermissions;
