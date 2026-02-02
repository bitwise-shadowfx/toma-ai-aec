import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 select-none">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Tomo ai <span className="font-normal text-purple-400">友</span>
      </h1>
    </div>
  );
};

export default Logo;