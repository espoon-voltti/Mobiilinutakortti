import React, { useState, useEffect } from 'react';
import { Button, Title, useNotify, GET_LIST } from 'react-admin';
import { Navigate } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import { juniorProvider } from '../providers/juniorProvider';
import { httpClient } from '../httpClients';
import { STATE } from '../state';
import api from '../api';
import styled from 'styled-components';

const getExpiredUsers = () =>
  juniorProvider(
    GET_LIST,
    {
      filter: { status: 'expired' },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'id', order: 'ASC' },
    },
    httpClient,
  );

const DeleteExpiredUsers = () => {
  const notify = useNotify();
  const notifyError = (msg) => notify(msg, 'error');

  const [state, setState] = useState(STATE.INITIAL);
  const [expiredUserCount, setExpiredUserCount] = useState(0);

  const getExpiredUserCount = async () => {
    setState(STATE.LOADING);

    try {
      const { total } = await getExpiredUsers();
      setExpiredUserCount(total);
    } catch (error) {
      notifyError('Käyttäjien haku epäonnistui');
      setExpiredUserCount(0);
    }

    setState(STATE.INITIAL);
  };

  useEffect(() => {
    getExpiredUserCount();
  }, []);

  const deleteExpiredUsers = async () => {
    const response = await httpClient(api.junior.deleteExpiredUsers, {
      method: 'DELETE',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notifyError('Virhe poistettaessa käyttäjiä');
      setState(STATE.INITIAL);
    } else {
      notify('Vanhentuneet käyttäjät poistettu', 'success');
      setState(STATE.DONE);
    }
  };

  const handleClick = async () => {
    setState(STATE.LOADING);
    await deleteExpiredUsers();
  };

  if (state === STATE.DONE) {
    return <Navigate to="/" />;
  }

  return (
    <Card>
      <Title title="Poista vanhat käyttäjät"></Title>
      <CardContent>
        <p>
          Vanhojen käyttäjien poistaminen poistaa järjestelmästä kaikki
          käyttäjätiedot nuorilta, joiden tila on "Tunnus vanhentunut". Näitä
          käyttäjiä on yhteensä {expiredUserCount}.
        </p>
        <Button
          onClick={handleClick}
          variant="outlined"
          disabled={state !== STATE.INITIAL || !expiredUserCount}
          label="Kyllä"
          size="large"
        >
          {state === STATE.INITIAL ? 'Poista vanhat käyttäjät' : 'Odota'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeleteExpiredUsers;
