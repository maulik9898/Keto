import { Paper } from '@mui/material';
import { PortInfo } from '@serialport/bindings-cpp';

interface DeviceProps {
  device: PortInfo;
  selected: boolean;
}

function Device({ device, selected }: DeviceProps) {
  return (
    <Paper
      variant={!selected ? 'outlined' : 'elevation'}
      className="flex flex-col p-4 w-full  "
    >
      <div className="flex flex-row ">
        <span className="text-lg opacity-90">
          {device.manufacturer} ({device.path})
        </span>
      </div>
      <div className="flex flex-row mt-2 space-x-4">
        {device.serialNumber && (
          <p className="text-small opacity-85">
            <span className=" inline opacity-90">Serial No: </span>
            {` ${device.serialNumber}`}
          </p>
        )}
        {device.productId && (
          <p className="text-small opacity-85 ">
            <span className=" inline opacity-75">Product Id: </span>
            {` ${device.productId}`}
          </p>
        )}
      </div>
    </Paper>
  );
}

export default Device;
