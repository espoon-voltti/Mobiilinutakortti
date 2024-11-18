import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AUTH_CHECK, useNotify } from 'react-admin'; // React Admin hooks
import { authProvider } from '../providers';
import { token } from '../utils';
import apiEndpoints from '../api';

const CustomLoginPage = () => {
  const notify = useNotify(); // React Admin's notify for error handling
  const history = useHistory();

  // Watch the URL fragment to extract the token
  useEffect(() => {
    const hash = window.location.hash; // Get the hash fragment
    const urlParams = new URLSearchParams(hash.split('?')[1]); // Extract query parameters from the hash
    const jwtToken = urlParams.get('t'); // Get the token from the query params
    if (jwtToken) {
      localStorage.setItem(token, jwtToken);
    }

    if (jwtToken) {
      handleLogin(jwtToken); // Handle login if token is found
    }
  }, [history.location]); // Re-run when the location changes

  const handleLogin = async (token) => {
    try {
      // Pass the token to React Admin's login function
      await authProvider(AUTH_CHECK);
      history.replace('/'); // Redirect to home/dashboard after successful login
    } catch (error) {
      notify('Login failed'); // Show error notification if login fails
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginContainer}>
        <h2>Kirjaudu sisään</h2>
        <a href={apiEndpoints.saml.login} style={styles.button}>
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
  button: {
    textSizeAdjust: '100%',
    boxSizing: 'inherit',
    height: '45px',
    padding: '0 27px',
    width: 'fit-content',
    minWidth: '100px',
    textAlign: 'center',
    overflowX: 'hidden',
    border: `1px solid rgb(0, 71, 182)`,
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '1rem',
    lineHeight: '1rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    letterSpacing: '0.2px',
    color: `rgb(255, 255, 255)`,
    backgroundColor: `rgb(0, 71, 182)`,
    marginRight: '0',
    textDecoration: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    // Pseudo-classes as nested objects
    '&:hover': {
      backgroundColor: `#00358a`,
    },
    '&:focus': {
      outline: `2px solid #4d7fcc`,
      outlineOffset: '2px',
    },
    '&:active': {
      backgroundColor: `#00358a`,
    },
  },
};

export default CustomLoginPage;
