import React from 'react';
import RoleplayInterface from '../components/RoleplayInterface';

const Roleplay: React.FC = () => {
  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex-1 min-h-0 w-full h-full">
        <RoleplayInterface />
      </div>
    </div>
  );
};

export default Roleplay;
