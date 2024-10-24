import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AUTH_CHECK, useNotify } from 'react-admin'; // React Admin hooks
import { authProvider } from '../providers';
import { token } from '../utils';

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
      history.push('/'); // Redirect to home/dashboard after successful login
    } catch (error) {
      notify('Login failed'); // Show error notification if login fails
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginContainer}>
        <h1>Kirjaudu</h1>
        <a href="http://localhost:3000/api/saml-ad">AD-kirjautuminen</a>
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
    minWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default CustomLoginPage;
