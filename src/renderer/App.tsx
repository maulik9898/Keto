import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { SerialPort } from 'serialport';
import { PortInfo } from '@serialport/bindings-cpp';
import icon from '../../assets/icon.svg';
import './App.css';

const Home = () => {
  const [devices, setDevices] = useState([] as PortInfo[]);

  useEffect(() => {
    SerialPort.list()
      .then((data) => {
        console.log(data);
        setDevices(data);
        return null;
      })
      .catch((err) => console.error);
  }, []);
  return (
    <div>
      <pre>{JSON.stringify(devices, null, 2)}</pre>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
