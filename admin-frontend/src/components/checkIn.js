import React from 'react';
import QrReader from 'react-qr-reader'
import { showNotification } from 'react-admin';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import httpClient from '../httpClient';
import api from '../api';

const Container = styled.div`
  height: 100%;
  width: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`


const CheckInView = (props) => {

  const handleScan = async (qrData) => {
    if (qrData) {
      const url = api.youthClub.checkIn;
      const body = JSON.stringify({
        clubId: props.match.params.youthClubId,
        juniorId: qrData
      });
      const options = {
        method: 'POST',
        body
      };
      await httpClient(url, options)
        .then(response => {
          const { showNotification } = props;
          if (response.statusCode < 200 || response.statusCode >= 300) {
            showNotification('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
          } else {
            showNotification('Sisäänkirjautuminen onnistunut!')
          }
        });
    }
  };

  const handleError = () => {
    const { showNotification } = props;
    showNotification('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
  }

  return (
    <Container>
      <QrReader
        delay={10000}
        onScan={handleScan}
        onError={handleError}
        style={{ width: 600, height: 600 }}
      />
      <Button variant="contained" href="#youthclub" >Takaisin</Button>
    </Container>
  )
}

export default connect(null, {
  showNotification
})(CheckInView);
