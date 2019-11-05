import React from 'react';
import { Admin, Resource } from 'react-admin';
import finnishMessages from 'ra-language-finnish';
import { authProvider, dataProvider} from './providers';
import { JuniorList, JuniorCreate, JuniorEdit } from './components/junior';
import { YouthClubList } from './components/youthClub';
import routes from './customRoutes';
import ChildCareIcon from '@material-ui/icons/ChildCare';

const messages = {
    'fi': finnishMessages,
};

const i18nProvider = locale => messages[locale];

const App = () =>
    <Admin locale="fi" i18nProvider={i18nProvider} dataProvider={dataProvider} authProvider={authProvider} customRoutes={routes}>
        {permissions => [
            permissions === 'SUPERADMIN' || permissions === ' ADMIN'
            ? <Resource name="junior" list={JuniorList} create={JuniorCreate}icon={ChildCareIcon} edit={ JuniorEdit } />
            : null,
            permissions === 'SUPERADMIN' || permissions === ' ADMIN'
            ? <Resource name="youthClub" list={YouthClubList} />
            : null
        ]}
    </Admin>;

export default App;
