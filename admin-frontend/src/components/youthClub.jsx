import React from 'react';
import {
  Button,
  List,
  Datagrid,
  TextField,
  useRecordContext,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { successSound, errorSound } from '../audio/audio';

const prepareCheckIn = (id, facingMode, continuousCheckIn) => {
  successSound.volume = 0;
  successSound.play();
  successSound.pause();
  successSound.currentTime = 0;
  errorSound.volume = 0;
  errorSound.play();
  errorSound.pause();
  errorSound.currentTime = 0;
  sessionStorage.setItem('initialCheckIn', id);
  sessionStorage.setItem('facingMode', facingMode);
  sessionStorage.setItem('continuousCheckIn', continuousCheckIn);
  successSound.volume = 1;
  errorSound.volume = 1;
};

const OpenCheckInButton = () => {
  const record = useRecordContext();
  return (
    <Link to={{
      pathname: `/checkIn/${record.id}`,
      state: { record },
    }}>
      <Button onClick={() => prepareCheckIn(record.id, 'user', false)} variant="outlined">Kirjautuminen</Button>
    </Link>
  );
};

const OpenContinuousCheckInButton = () => {
  const record = useRecordContext();
  return (
    <Link to={{
      pathname: `/checkIn/${record.id}`,
      state: { record },
    }}>
      <Button onClick={() => prepareCheckIn(record.id, 'environment', true)} variant="outlined">Jatkuva
        kirjautuminen</Button>
    </Link>
  );
};

const OpenLogBookButton = () => {
  const record = useRecordContext();
  return <Button variant="outlined" href={`#/logbook/${record.id}`}>Logbook</Button>;
};

const OpenLogBookCheckInsButton = () => {
  const record = useRecordContext();
  return <Button variant="outlined" href={`#/checkIns/${record.id}`}>Kirjautumiset</Button>;
};

export const YouthClubList = (props) => (
  <List title="Nuorisotilat" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
    <Datagrid>
      <TextField label="Nimi" source="name" />
      {/* <TextField label="Postinumero" source="postCode" /> */}
      <OpenCheckInButton />
      <OpenContinuousCheckInButton />
      <OpenLogBookButton />
      <OpenLogBookCheckInsButton />
    </Datagrid>
  </List>
);
