import React, { useEffect, useState } from 'react';
import { getHWID } from 'renderer/hwid/hwid';

type NotAuthenticatedProps = {
  status: 'NOT AUTHENTICATED' | 'EXPIRED';
};

const NotAuthenticated: React.FC<NotAuthenticatedProps> = ({ status }) => {
  const [machineId, setMachineId] = useState('');

  useEffect(() => {
    const getLicenceKey = async () => {
      const hwid = await getHWID();
      setMachineId(hwid);
    };
    getLicenceKey();
  }, []);

  let message = '';
  if (status === 'NOT AUTHENTICATED') {
    message = 'Your license is not valid.';
  } else if (status === 'EXPIRED') {
    message =
      'Your license is expired. You must renew your license in order to run this software.';
  }

  return (
    <div className="min-h-screen bg-gradient-to-r min-w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-xl font-bold text-gray-700 mb-4">{message}</p>
        {machineId && (
          <p className="text-gray-700">
            <span className="font-semibold">Licence key: </span>
            {machineId}
          </p>
        )}
        <p className="text-lg text-gray-700 mt-4">
          Contact your vendor to renew/add your license:
          <br />
          <span className="text-blue-300 font-mono">
            Development@ketomotors.com
          </span>
        </p>
      </div>
    </div>
  );
};

export default NotAuthenticated;