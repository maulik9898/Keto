import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import DeviceList from './components/DeviceList';
import 'tailwindcss/tailwind.css';
import Com from './components/Com';
import { storeGet, storeGetSaved } from './store';
import DbcView from './components/DbcView';

const Home = () => {
  return <>{storeGetSaved() ? <DeviceList /> : <DbcView />}</>;
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
