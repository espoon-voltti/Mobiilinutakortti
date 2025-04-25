import { httpClient } from './';
import api from '../api';
import { token } from '../utils';
import { authProvider } from '../providers';

export const httpClientWithResponse = (url, options = {}, disableAuth = false) => {
    const refreshOptions = {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json' })
    };
    const authToken = localStorage.getItem(token);
    if (authToken) {
        refreshOptions.headers.set('Authorization', `Bearer ${authToken}`);
    }

    return fetch(api.youthWorker.refresh, refreshOptions).then(refreshResponse => {
        refreshResponse = refreshResponse.json();
        if (refreshResponse.statusCode < 200 || refreshResponse.statusCode >= 300) {
            authProvider.logout();
            window.location.reload();
            return Promise.resolve();
        } else {
            return refreshResponse;
        }
    }).then(({ access_token }) => {
        if (!disableAuth) {
            localStorage.setItem(token, access_token);
        }
        return httpClient(url, options);
    });
};
