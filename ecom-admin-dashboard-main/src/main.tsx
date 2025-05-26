import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme } from '@radix-ui/themes';
import { UserProvider } from './contexts/UserContext'; // Import UserProvider
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Theme>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserProvider> {/* Wrap the app in UserProvider */}
          <App />
        </UserProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </Theme>
);
