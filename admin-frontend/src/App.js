import React, { useEffect } from 'react';
import { Admin, Resource } from 'react-admin';

import finnishMessages from 'ra-language-finnish';
import { authProvider, dataProvider } from './providers';
import { JuniorList, JuniorCreate, JuniorEdit } from './components/junior';
import { YouthClubList } from './components/youthClub';
import { YouthWorkerList, YouthWorkerEdit } from './components/youthWorker';
import { routes, superAdminRoutes } from './customRoutes';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import { httpClient } from './httpClients';
import api from './api';
import { AUTH_LOGOUT } from 'react-admin';
import CustomLayout from './customLayout';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import usePermissions from './hooks/usePermissions';
import CustomLoginPage from './components/customLogin';
import CustomLogoutButton from './components/customLogout';
import { LandingPage } from './components/landingPage';

const messages = {
  fi: finnishMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], 'fi');

const App = () => {
  const { isSuperAdmin } = usePermissions();
  const customRoutes = routes.concat(...(isSuperAdmin ? superAdminRoutes : []));

  useEffect(() => {
    let validCheck = setInterval(async () => {
      const url = api.auth.login;
      const body = {
        method: 'GET',
      };
      if (!window.location.href.includes('checkIn')) {
        await httpClient(url, body).then(async (response) => {
          if (
            response.statusCode < 200 ||
            response.statusCode >= 300 ||
            response.result === false
          ) {
            await authProvider(AUTH_LOGOUT, {});
            window.location.reload();
          }
        });
      }
    }, 60000);

    return () => {
      clearInterval(validCheck);
      validCheck = null;
    };
  }, []);

  return (
    <Admin
      dashboard={LandingPage}
      layout={CustomLayout}
      loginPage={CustomLoginPage}
      i18nProvider={i18nProvider}
      dataProvider={dataProvider}
      authProvider={authProvider}
      customRoutes={customRoutes}
      disableTelemetry
      logoutButton={CustomLogoutButton}
    >
      {(permissions) => [
        permissions === 'SUPERADMIN' || permissions === 'ADMIN' ? (
          <Resource
            name="junior"
            options={{ label: 'Nuoret' }}
            list={JuniorList}
            create={JuniorCreate}
            icon={ChildCareIcon}
            edit={JuniorEdit}
          />
        ) : null,

        permissions === 'SUPERADMIN' || permissions === 'ADMIN' ? (
          <Resource
            name="youthClub"
            options={{ label: 'Nuorisotilat' }}
            list={YouthClubList}
          />
        ) : null,

        permissions === 'SUPERADMIN' ? (
          <Resource
            name="youthWorker"
            options={{ label: 'Nuorisotyöntekijät' }}
            list={YouthWorkerList}
            edit={YouthWorkerEdit}
          />
        ) : null,
      ]}
    </Admin>
  );
};

export default App;
