import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin'; // React Admin hooks
import { authProvider } from '../providers';
import { token } from '../utils';
import apiEndpoints from '../api';

const CustomLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search.slice(1));
    const jwtToken = urlParams.get('t'); // Get the token from the query params
    if (jwtToken) {
      localStorage.setItem(token, jwtToken);
      navigate('/', { replace: true }); // Redirect to home/dashboard after successful login
    }
  }, [location.search, navigate]); // Re-run when the location changes

  return (
    <div style={styles.container}>
      <div style={styles.loginContainer}>
        <h2 aria-label="Kirjaudu sisään">Kirjaudu sisään</h2>
        <a
          className="loginButton"
          href={apiEndpoints.saml.login}
        >
          Espoo AD
        </a>
      </div>
    </div>
  );
};

// Some simple styles for the page
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundSize: 'cover',
    // backgroundImage:
    //   'radial-gradient(circle at 50% 14em, #313264 0%, #00023b 60%, #00023b 100%)',
    backgroundImage: 'url(/nuta-admin-bg.jpg)',
    backgroundRepeat: 'no-repeat',
  },
  loginContainer: {
    backgroundColor: '#FFFFFF',
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px',
  },
};

export default CustomLoginPage;
