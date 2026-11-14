import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { debugData } from './utils/debugData';

debugData<unknown>([{ action: 'setVisible', data: true }]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
