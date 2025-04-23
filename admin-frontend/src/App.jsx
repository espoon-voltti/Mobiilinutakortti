import React, { useEffect } from 'react';
import { Admin, CustomRoutes, Resource } from 'react-admin';
import { Route } from 'react-router-dom';

import finnishMessages from 'ra-language-finnish';
import { authProvider, dataProvider } from './providers';
import { JuniorList, JuniorCreate, JuniorEdit } from './components/junior';
import { YouthClubList } from './components/youthClub';
import { YouthWorkerList, YouthWorkerEdit } from './components/youthWorker';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import { httpClient } from './httpClients';
import api from './api';
import CustomLayout from './customLayout';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import CustomLoginPage from './components/customLogin';
import CustomLogoutButton from './components/customLogout';
import { LandingPage } from './components/landingPage';
import CheckInView from './components/checkIn/checkIn';
import LogBookView from './components/logbook';
import LogBookListView from './components/logbookList';
import NewSeason from './components/newSeason';
import DeleteExpiredUsers from './components/deleteExpiredUsers';

const messages = {
  fi: finnishMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], 'fi');

const App = () => {
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
            await authProvider.logout();
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
      disableTelemetry
      logoutButton={CustomLogoutButton}
    >
      <Resource
        name="junior"
        options={{ label: 'Nuoret' }}
        list={JuniorList}
        create={JuniorCreate}
        icon={ChildCareIcon}
        edit={JuniorEdit}
      />

      <Resource
        name="youthClub"
        options={{ label: 'Nuorisotilat' }}
        list={YouthClubList}
      />

      <Resource
        name="youthWorker"
        options={{ label: 'Nuorisotyöntekijät' }}
        list={YouthWorkerList}
        edit={YouthWorkerEdit}
      />

      <CustomRoutes noLayout>
        <Route exact path="/checkIn/:youthClubId" element={<CheckInView />} />
      </CustomRoutes>
      <CustomRoutes>
        <Route exact path="/logbook/:youthClubId" element={<LogBookView />} />
        <Route exact path="/checkIns/:youthClubId" element={<LogBookListView />} />
        <Route path="/newSeason" element={<NewSeason />} />
        <Route path="/deleteExpiredUsers" element={<DeleteExpiredUsers />} />
      </CustomRoutes>

    </Admin>
  );
};

export default App;
