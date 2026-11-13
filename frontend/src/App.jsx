import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { store } from './stores/store.js';
import queryClient from './api/queryClient.js';
import AppRoutes from './routes/AppRoutes.jsx';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
