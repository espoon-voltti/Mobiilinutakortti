import {
  AUTH_ERROR,
  AUTH_CHECK,
  AUTH_LOGOUT,
  AUTH_GET_PERMISSIONS,
} from 'react-admin';
import { httpClient } from '../httpClients';
import api from '../api';
import { token } from '../utils';

export const authProvider = (type, params) => {
  if (type === AUTH_ERROR) {
    const status = params.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(token);
      localStorage.removeItem('role');
      localStorage.removeItem('main-youth-club');
      return Promise.reject();
    }
    return Promise.resolve();
  }
  if (type === AUTH_CHECK) {
    const hasToken = localStorage.getItem(token);
    if (!hasToken) {
      return Promise.reject();
    }
    if (hasToken && localStorage.getItem('role')) {
      return Promise.resolve();
    }

    return httpClient(api.youthWorker.self, { method: 'GET' }).then(
      (response) => {
        if (response.isSuperUser) {
          localStorage.setItem('role', 'SUPERADMIN');
        } else {
          localStorage.setItem('role', 'ADMIN');
        }
        localStorage.setItem('main-youth-club', response.mainYouthClub);
        // Dirty hack; forces recalculation of custom routes based on user role inside App.js
        window.location.reload();
      },
    );
  }
  if (type === AUTH_LOGOUT) {
    localStorage.removeItem(token);
    localStorage.removeItem('role');
    localStorage.removeItem('main-youth-club');
    return Promise.resolve();
  }

  if (type === AUTH_GET_PERMISSIONS) {
    const role = localStorage.getItem('role');
    return role ? Promise.resolve(role) : Promise.reject();
  }
  return Promise.resolve();
};
