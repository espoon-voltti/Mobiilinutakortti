import React, { useState, useEffect, useRef } from 'react';
import { useNotify } from 'react-admin';
import { getYouthClubs, token } from '../utils';
import { httpClient } from '../httpClients';
import api from '../api';

export const LandingPage = () => {
  const notify = useNotify();
  const [youthClubs, setYouthClubs] = useState([]);
  const dropdownRef = useRef(null);
  const usersYouthClubId = localStorage.getItem('main-youth-club');

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (token) {
      const addYouthClubsToState = async () => {
        const parsedYouthClubs = await getYouthClubs();
        setYouthClubs(
          parsedYouthClubs.map((yc) => {
            return { label: yc.name, value: yc.id };
          }),
        );
        dropdownRef.current.value = usersYouthClubId || -1;
        setSelectedYouthClub(usersYouthClubId || -1);
      };
      addYouthClubsToState();
    }
  }, []);

  const [selectedYouthClub, setSelectedYouthClub] = useState(-1);
  const handleYouthClubChange = (e) => {
    setSelectedYouthClub(e.target.value);
  };

  const setDefaultYouthClub = async () => {
    const response = await httpClient(api.youthWorker.setMainYouthClub, {
      method: 'POST',
      body: JSON.stringify({
        clubId: selectedYouthClub,
      }),
    });
    if (response) {
      localStorage.setItem('main-youth-club', selectedYouthClub);
      notify('Oletusnuorisotila asetettu');
    } else {
      notify('Virhe asettaessa nuorisotilaa');
    }
  };

  const listSelectedClubJuniors = () => {
    window.location =
      selectedYouthClub.toString() === '-1'
        ? '#/junior'
        : `#/junior?displayedFilters=%7B%22homeYouthClub%22%3Atrue%7D&filter=%7B%22homeYouthClub%22%3A%22${selectedYouthClub}%22%7D`;
  };

  return (
    <div style={{ marginLeft: '20%', marginTop: '3em' }}>
      <p>Tervetuloa</p>
      <div>
        Jatka nuorten&nbsp;
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '-webkit-link',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0',
            textDecoration: 'underline',
          }}
          onClick={listSelectedClubJuniors}
        >
          listaukseen nuorisotilalle
        </button>
        <select
          ref={dropdownRef}
          onChange={handleYouthClubChange}
          style={{ fontSize: '1rem', marginLeft: '0.5rem', marginTop: '1rem' }}
        >
          <option key="" value="-1"></option>
          {youthClubs.map((yc) => (
            <option key={yc.label} value={yc.value}>
              {yc.label}
            </option>
          ))}
        </select>
        {selectedYouthClub.toString() !== '-1' &&
          selectedYouthClub !== usersYouthClubId && (
            <button
              style={{
                marginLeft: '0.5rem',
                background: 'none',
                border: 'none',
                color: '-webkit-link',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0',
                textDecoration: 'underline',
              }}
              onClick={setDefaultYouthClub}
            >
              (aseta valittu oletukseksi)
            </button>
          )}
      </div>
      <p>
        tai listaa <a href="#/junior">kaikki nuoret</a>.
      </p>
      {/* {(useEntraID || userInfo.current?.passwordLastChanged) ? null : (<div style={{marginTop: '3em'}}>
        <p>Muistutus: sinun tulee <a href='#/password'>vaihtaa salasanasi</a>.</p>
      </div>)} */}
      {!usersYouthClubId && (
        <div style={{ marginTop: '3em' }}>
          <p>Voit asettaa itsellesi oletusnuorisotilan yltä.</p>
        </div>
      )}
    </div>
  );
};
