const baseURL = process.env.REACT_APP_ENDPOINT;

export const get = async (uri: string, token?: string, noCors?: boolean): Promise<any> => {
    const url: string = `${baseURL}${uri}`;
    const init: RequestInit = {
        method: 'GET',
        mode: noCors ? 'no-cors' : 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    const response = await fetch(url, init);
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);

};

export const post = async (uri: string, params?: object): Promise<any> => {
    const url: string = `${baseURL}${uri}`;
    const init: RequestInit = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    };
    const response = await fetch(url, init);
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);

};

export const getCachedToken = async (): Promise<any> => {
    const response = await fetch('/token');
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);
  }
