import React from 'react';
import { Route } from 'react-router-dom';
import CheckInView from './components/checkIn/checkIn';
import LogBookView from './components/logbook';
import LogBookListView from './components/logbookList';
import NewSeason from './components/newSeason';
import DeleteExpiredUsers from './components/deleteExpiredUsers';

export const routes = [
  <Route exact path="/checkIn/:youthClubId" component={CheckInView} noLayout />,
  <Route exact path="/logbook/:youthClubId" component={LogBookView} />,
  <Route exact path="/checkIns/:youthClubId" component={LogBookListView} />,
];

export const superAdminRoutes = [
  <Route path="/newSeason" component={NewSeason} />,
  <Route path="/deleteExpiredUsers" component={DeleteExpiredUsers} />,
];
