import React from 'react';
import ReactDOM from 'react-dom';
import './i18n';
import { FirestoreProvider } from 'react-firestore';
import './styles/index.css';
import * as serviceWorker from './serviceWorker';
import * as Sentry from '@sentry/react';
import dbHelper from './helpers/db';
import App from './app';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';




const dbInstance = dbHelper.init();
Sentry.init({ dsn: process.env.REACT_APP_SENTRY_URL });
console.log(process.env.REACT_APP_FIRESTORE_ADDRESS);

ReactDOM.render(
  <FirestoreProvider firebase={dbInstance}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>

  </FirestoreProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
