import React from 'react';
import ChatInterface from '../components/ChatInterface';

const IARoones: React.FC = () => {
  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex-1 min-h-0 w-full h-full">
        <ChatInterface fullScreen />
      </div>
    </div>
  );
};

export default IARoones;
