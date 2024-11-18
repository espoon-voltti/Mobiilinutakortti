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
      },
    );
  }
  if (type === AUTH_LOGOUT) {
    localStorage.removeItem(token);
    localStorage.removeItem('role');
    return Promise.resolve();
  }

  if (type === AUTH_GET_PERMISSIONS) {
    const role = localStorage.getItem('role');
    return role ? Promise.resolve(role) : Promise.reject();
  }
  return Promise.resolve();
};
