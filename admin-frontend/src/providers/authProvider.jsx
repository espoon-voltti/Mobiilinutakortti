import { httpClient } from '../httpClients';
import api from '../api';
import { token } from '../utils';

export const authProvider = {
  login: ({ username, password }) => {
    throw new Error('Login method not implemented.');
  },

  logout: () => {
    localStorage.removeItem(token);
    localStorage.removeItem('role');
    localStorage.removeItem('main-youth-club');
    return Promise.resolve();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      // Error indicates authentication/authorization issue, trigger logout
      localStorage.removeItem(token);
      localStorage.removeItem('role');
      localStorage.removeItem('main-youth-club');
      return Promise.reject(new Error('Kirjautuminen epäonnistui'));
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem(token)
      ? Promise.resolve()
      : Promise.reject();
  },

  getPermissions: async () => {
    const role = localStorage.getItem('role');
    if (role) {
      return role;
    }
    await authProvider.getIdentity();
    return localStorage.getItem('role')
  },

  getIdentity: async () => {
    const response = await httpClient(api.youthWorker.self, { method: 'GET' });
    localStorage.setItem('role', response.isSuperUser ? 'SUPERADMIN' : 'ADMIN');
    localStorage.setItem('main-youth-club', response.mainYouthClub);
    return response;
  },
};
