import React, { useState, useEffect } from 'react';
import { Notification } from 'react-admin';
import { useBlocker, useLocation, useParams } from 'react-router-dom';
import ConfirmNavigationModal from '../ConfirmNavigationModal';
import QrReader from './qrReader';
import QrCheckResultScreen from './qrCheckResultScreen';
import LoadingMessage from '../loadingMessage';
import { useNotify } from 'react-admin';
import styled from 'styled-components';
import { httpClientWithResponse } from '../../httpClients';
import api from '../../api';
import CheckinBackground from './checkInBackground';
import { successSound, errorSound } from '../../audio/audio';

const Container = styled.div`
  height: 100%;
  width: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const QrReaderContainer = styled.div`
  margin-top: 7.4em;
  width: 32em;
  border: 55px solid #f9e51e;
  -webkit-box-shadow: 2px 10px 60px -19px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 2px 10px 60px -19px rgba(0, 0, 0, 0.75);
  box-shadow: 2px 10px 60px -19px rgba(0, 0, 0, 0.75);
`;

let youthClubName = '';

const CheckInView = () => {
  const location = useLocation();
  const { youthClubId } = useParams();
  const [showQRCode, setShowQRCode] = useState(true);
  const [showQrCheckNotification, setShowQrCheckNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const notify = useNotify();

  // Timeout for automatic logout
  const timeoutDuration = 1800; // Set your desired timeout duration in seconds
  const [remainingTime, setRemainingTime] = useState(timeoutDuration); // Set your desired initial timeout in seconds

  const logout = () => {
    sessionStorage.removeItem('initialCheckin');

    if (import.meta.env.VITE_ADMIN_FRONTEND_URL) {
      document.location.href = import.meta.env.VITE_ADMIN_FRONTEND_URL;
    } else {
      document.location.href = '/';
    }
  };

  // For scanning multiple users set a timeout for automatic logout
  // For scanning single user clear the session token and reload the page after 3 minutes to fix
  // qr reader stopping scanning after a period of time
  useEffect(() => {
    const continuousCheckIn = sessionStorage.getItem('continuousCheckIn');
    if (continuousCheckIn == 'false') {
      localStorage.removeItem('admin-token');
      const initialCheckIn = sessionStorage.getItem('initialCheckIn');
      const path = location.pathname;
      const m = path.match(/\d+/);
      const id = m !== null ? m.shift() : null;
      if (id !== initialCheckIn) {
        logout();
      }

      const timer = setTimeout(() => window.location.reload(), 18000);
      return () => clearTimeout(timer);
    } else {
      // Set up the timeout
      const timer = setTimeout(() => {
        logout();
      }, timeoutDuration * 1000);

      // Update the remaining time every second
      const interval = setInterval(() => {
        setRemainingTime(prevRemainingTime => prevRemainingTime - 1);
      }, 1000);

      // Clean up timers when the component unmounts
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    if (location.state != null) {
      localStorage.setItem('youthClubName', JSON.stringify(location.state.record.name));
      youthClubName = location.state.record.name;
    }
    if (location.state === undefined) {
      youthClubName = JSON.parse(localStorage.getItem('youthClubName'));
    }
  }, []);

  const tryToPlayAudio = (success) => {
    if (success) {
      successSound.currentTime = 0;
      successSound.volume = 1;
      return successSound.play();
    } else {
      errorSound.currentTime = 0;
      errorSound.volume = 0.1;
      return errorSound.play();
    }
  };

  const handleCheckInReturn = (success) => {
    setLoading(false);
    setShowQRCode(false);
    setCheckInSuccess(success);
    setShowQrCheckNotification(true);
    tryToPlayAudio(success).catch(() => notify('Audion toistaminen epäonnistui. Tarkista selaimesi oikeudet.', 'warning'));
    setTimeout(() => {
      setShowQrCheckNotification(false);
      setCheckInSuccess(null);
      setShowQRCode(true);
    }, success ? 2500 : 3000);
  };

  const handleScan = async (qrData) => {
    if (qrData) {
      setShowQRCode(false);
      setLoading(true);

      // Reset timer when continuously scanning
      setRemainingTime(timeoutDuration);

      const url = api.youthClub.checkIn;
      const body = JSON.stringify({
        clubId: youthClubId,
        juniorId: qrData,
      });
      const options = {
        method: 'POST',
        body,
      };
      await httpClientWithResponse(url, options, true)
        .then(response => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            setLoading(false);
            notify('Jokin meni pieleen! Kokeile uudestaan.', 'warning');
            setShowQRCode(true);
          } else {
            handleCheckInReturn(response.success);
          }
        });
    }
  };

  // Calculate minutes and seconds from remaining time
  const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
  const seconds = String(remainingTime % 60).padStart(2, '0');

  const continuousCheckIn = sessionStorage.getItem('continuousCheckIn');
  const facingMode = sessionStorage.getItem('facingMode') || 'user';

  // TODO: const blocker = useBlocker(continuousCheckIn == 'false');

  return (
    <Container>
      <Notification />
      <CheckinBackground />

      {/* TODO */}
      {/*{blocker.state === 'blocked' && (*/}
      {/*  <ConfirmNavigationModal*/}
      {/*    onCancel={() => blocker.reset()}*/}
      {/*    onConfirm={() => logout()}*/}
      {/*  />*/}
      {/*)}*/}
      {continuousCheckIn == 'true' && (
        <p>Kirjaudutaan ulos: {minutes}:{seconds}</p>
      )}

      {showQRCode && (
        <QrReaderContainer>
          <QrReader
            delay={300}
            onScan={handleScan}
            facingMode={facingMode}
            style={{ width: '100%', height: '100%' }}
          />
        </QrReaderContainer>
      )}

      {showQrCheckNotification && <QrCheckResultScreen successful={checkInSuccess} youthClubName={youthClubName} />}
      {loading && (
        <LoadingMessage message={'Odota hetki'} />
      )}
    </Container>
  );
};

export default CheckInView;
