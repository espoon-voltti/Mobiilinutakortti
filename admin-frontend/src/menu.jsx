import React from 'react';
import { Menu } from 'react-admin';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import ListIcon from '@material-ui/icons/ViewList';
import NewSeasonIcon from '@material-ui/icons/Autorenew';
import DeleteIcon from '@material-ui/icons/DeleteForever';
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
