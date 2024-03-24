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
import { storeClear, storeGet, storeGetSaved } from './store';
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

export default function App() {
  const [auth, setAuth] = useState<
    'AUTHENTICATED' | 'LOADING' | 'NOT AUTHENTICATED'
  >('LOADING');

  useEffect(() => {
    getHWID().then((id) => {
      fetch(
        'https://juhseowxjfodwhrrmrql.supabase.co/functions/v1/check-licenses',
        {
          method: 'GET',
          // mode: 'no-cors',
          headers: {
            'x-license-key': id,
          },
        }
      )
        .then((response) => {
          if (response.status === 200) {
            setAuth('AUTHENTICATED');
          } else {
            setAuth('NOT AUTHENTICATED');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setAuth('NOT AUTHENTICATED');
        });
    });
  }, []);

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
            <Route path="/" element={<NotAuthenticated />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

// change documentation link
// session logging
// remove json view update to .bin from .dbc