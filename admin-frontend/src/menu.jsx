import React from 'react';
import { Menu } from 'react-admin';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ListIcon from '@mui/icons-material/ViewList';
import NewSeasonIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import usePermissions from './hooks/usePermissions';

const MyMenu = () => {
  const { isSuperAdmin } = usePermissions();
  return (
    <Menu>
      <Menu.DashboardItem />
      <Menu.Item
        to="/junior"
        primaryText="Nuoret"
        leftIcon={<ChildCareIcon />}
      />
      <Menu.Item
        to="/youthClub"
        primaryText="Nuorisotilat"
        leftIcon={<ListIcon />}
      />
      {isSuperAdmin && (
        <>
          <Menu.Item
            to="/youthWorker"
            primaryText="Nuorisotyöntekijät"
            leftIcon={<ListIcon />}
          />
          <Menu.Item
            to="/newSeason"
            primaryText="Aloita uusi kausi"
            leftIcon={<NewSeasonIcon />}
          />
          <Menu.Item
            to="/deleteExpiredUsers"
            primaryText="Poista vanhat käyttäjät"
            leftIcon={<DeleteIcon />}
          />
        </>
      )}
    </Menu>
  );
};

export default MyMenu;
