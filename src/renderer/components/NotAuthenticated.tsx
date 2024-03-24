import React, { useEffect, useCallback, useState } from 'react';
import { getHWID } from 'renderer/hwid/hwid';

const NotAuthenticated = () => {
  const [machineId, setMachineId] = useState('');

  const handleKeyPress = useCallback(async (event: KeyboardEvent) => {
    if (event.key === 'i' && event.ctrlKey) {
      const hwid = await getHWID();
      setMachineId(hwid);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="min-h-screen bg-gradient-to-r min-w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">
          Not Authenticated
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Oops! It seems like you are not authenticated to access this page.
        </p>
        {machineId && (
          <p className="text-lg text-gray-700">Machine ID: {machineId}</p>
        )}
      </div>
    </div>
  );
};

export default NotAuthenticated;