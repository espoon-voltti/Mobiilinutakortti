import React from 'react';
import { Layout, Notification } from 'react-admin';
import styled from 'styled-components';
import MyMenu from './menu';

const CustomNotification = styled(Notification)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem !important;
  font-weight: 400 !important;
  line-height: 1.33 !important;
  letter-spacing: 0em !important;
  padding-bottom: 20px !important;
  padding-top: 20px !important;
`;

const CustomLayout = (props) => (
  <Layout {...props} notification={CustomNotification} menu={MyMenu} />
);

export default CustomLayout;
