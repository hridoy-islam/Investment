import persistStore from 'redux-persist/es/persistStore';
import AppProvider from './providers';
import store from './redux/store';
import AppRouter from './routes';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from './components/ui/toaster';

const persistor = persistStore(store);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppProvider>
          <Toaster />
          <AppRouter />
        </AppProvider>
      </PersistGate>
    </Provider>
  );
}
