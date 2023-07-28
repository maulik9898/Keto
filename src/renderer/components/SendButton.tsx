import { Send } from '@mui/icons-material';
import { Button } from '@mui/material';
import React from 'react';
import { ButtonI, useButtonStore } from 'renderer/store';

interface ButtonProps {
  button: ButtonI;
  onClick: (button: ButtonI) => void;
}

const SendButton: React.FC<ButtonProps> = ({ button, onClick }) => {
  const deleteButton = useButtonStore((state) => state.deleteButton);
  return (
    <div>
      <Button
        onContextMenu={(e) => {
          e.preventDefault();
          deleteButton(button.id);
        }}
        color="secondary"
        key={button.name}
        variant="contained"
        startIcon={<Send />}
        onClick={() => onClick(button)}
      >
        {button.name}
      </Button>
    </div>
  );
};

export default SendButton;
