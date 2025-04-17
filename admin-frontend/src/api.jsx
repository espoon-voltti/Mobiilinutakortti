const appUrl = import.meta.env.VITE_ENDPOINT;

const apiEndpoints = {
  junior: {
    create: `${appUrl}/junior/register`,
    edit: `${appUrl}/junior/edit`,
    list: `${appUrl}/junior/list`,
    reset: `${appUrl}/junior/reset`,
    base: `${appUrl}/junior/`,
    dummynumber: `${appUrl}/junior/nextAvailableDummyPhoneNumber`,
    newSeason: `${appUrl}/junior/newSeason`,
    deleteExpiredUsers: `${appUrl}/junior/newSeason/clearExpired`,
  },
  auth: {
    login: `${appUrl}/admin/login`,
  },
  saml: {
    login: `${appUrl}/saml-ad`,
    logout: `${appUrl}/saml-ad/logout`,
  },
  youthClub: {
    list: `${appUrl}/club/list`,
    checkIn: `${appUrl}/club/check-in`,
    logBook: `${appUrl}/club/logbook`,
    checkIns: `${appUrl}/club/check-ins`,
  },
  youthWorker: {
    create: `${appUrl}/admin/register`,
    edit: `${appUrl}/admin/edit`,
    list: `${appUrl}/admin/list`,
    self: `${appUrl}/admin/getSelf`,
    refresh: `${appUrl}/admin/refresh`,
    password: `${appUrl}/admin/changePassword`,
    base: `${appUrl}/admin/`,
    setMainYouthClub: `${appUrl}/admin/setMainYouthClub`,
  },
};

export default apiEndpoints;
