import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const startApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

if (window.hasOwnProperty('cordova')) {
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}
