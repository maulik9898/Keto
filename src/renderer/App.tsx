import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import './App.css';
import DeviceList from './components/DeviceList';
import 'tailwindcss/tailwind.css';
import Com from './components/Com';
import { storeClear, storeGet, storeGetSaved } from './store';
import DbcView from './components/DbcView';
import { useEffect, useRef, useRef } from 'react';

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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="com">
          <Route path=":port" element={<Com />} />
        </Route>
        <Route path="/dbc" element={<DbcView />} />
      </Routes>
    </Router>
  );
}
