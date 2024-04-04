import { createRoot } from 'react-dom/client';
import log from 'electron-log/renderer';
import { Provider } from 'react-redux';
import App from './App';
import i18n from './i18n/config';
import jobStore from './pages/import/jobStore';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <Provider store={jobStore}>
    <App />
  </Provider>,
);

// calling IPC exposed from preload script
// eslint-disable-next-line promise/always-return
window.electron.ipcRenderer
  .getSettings()
  .then((settings) => {
    log.debug(`Active language ${settings.ui.language}`);
    return i18n.changeLanguage(settings.ui.language);
  })
  .catch((reason) => {
    log.error(reason.message);
  });
