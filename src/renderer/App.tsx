import { useEffect, useRef, useState } from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import './App.css';
import DeviceList from './components/DeviceList';
import 'tailwindcss/tailwind.css';
import Com from './components/Com';
import { storeGetSaved } from './store';
import DbcView from './components/DbcView';
import { getHWID } from './hwid/hwid';
import NotAuthenticated from './components/NotAuthenticated';

const Home = () => {
  const isDbcPresent = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    isDbcPresent.current = storeGetSaved();
    if (!isDbcPresent.current) {
      navigate('/dbc', { replace: true });
    }
  });

  return (
    <>
      {' '}
      <DeviceList />{' '}
    </>
  );
};

type AuthStatus = 'AUTHENTICATED' | 'LOADING' | 'NOT AUTHENTICATED' | 'EXPIRED';

export default function App() {
  const [auth, setAuth] = useState<AuthStatus>('LOADING');
  const [checkInterval, _n] = useState(60 * 60 * 1000); // 2 minutes in milliseconds

  useEffect(() => {
    const checkLicense = () => {
      getHWID().then((id) => {
        fetch(
          'https://juhseowxjfodwhrrmrql.supabase.co/functions/v1/check-licenses',
          {
            method: 'GET',
            headers: {
              'x-license-key': id,
            },
          }
        )
          .then((response) => {
            if (response.status === 200) {
              setAuth('AUTHENTICATED');
            } else if (response.status === 403) {
              return response.text().then((message) => {
                if (message === 'License key has expired') {
                  setAuth('EXPIRED');
                } else {
                  setAuth('NOT AUTHENTICATED');
                }
              });
            } else {
              setAuth('NOT AUTHENTICATED');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            setAuth('NOT AUTHENTICATED');
          });
      });
    };

    checkLicense(); // Initial check
    const interval = setInterval(checkLicense, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [checkInterval]);

  if (auth === 'LOADING') {
    return <div></div>;
  }

  return (
    <Router>
      <Routes>
        {auth === 'AUTHENTICATED' ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="com">
              <Route path=":port" element={<Com />} />
            </Route>
            <Route path="/dbc" element={<DbcView />} />
          </>
        ) : (
          <>
            <Route path="/" element={<NotAuthenticated status={auth} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}