import React, { forwardRef } from 'react';
import { useHistory } from 'react-router-dom';
import apiEndpoints from '../api';
import { token } from '../utils';

const CustomLogoutButton = forwardRef(() => {
  const history = useHistory();

  return (
    <a
      className="linkButton"
      style={styles.linkButton}
      href={apiEndpoints.saml.logout}
      onClick={() => {
        localStorage.removeItem(token);
        localStorage.removeItem('role');
        history.replace('/');
        return true;
      }}
    >
      Kirjaudu ulos
    </a>
  );
});

const styles = {
  linkButton: {
    margin: '0',
    width: '100%',
    display: 'flex',
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'left',
    alignItems: 'center',
    paddingTop: '8px',
    paddingBottom: '8px',
    justifyContent: 'flex-start',
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 0.54)',
    overflow: 'hidden',
    fontSize: '1rem',
    minHeight: '48px',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: '400',
    lineHeight: '1.5',
    whiteSpace: 'nowrap',
    letterSpacing: '0.00938em',
    paddingLeft: '16px',
    paddingRight: '16px',
  },
};

export default CustomLogoutButton;
