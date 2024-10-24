import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useNotify } from 'react-admin'; // React Admin hooks
import { authProvider } from '../providers';

const LogoutSuccessView = () => {
  const history = useHistory();
  const notify = useNotify(); // React Admin's notify for error handling
  const handleLogout = async () => {
    try {
      console.log('LogoutSuccessView, here we go');
      await authProvider('AUTH_LOGOUT');
      history.push('/login');
    } catch (error) {
      notify('Logout failed'); // Show error notification if login fails
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return <></>;
};

export default LogoutSuccessView;
