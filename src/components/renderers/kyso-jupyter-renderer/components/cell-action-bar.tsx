import React from 'react';

const CellActionBar = () => {
  return (
    <div className="absolute z-50 top-0 right-0">
      <div className=" inline-flex justify-left items-center m-2 float-right rounded-md border border-gray-300 shadow-sm px-4 py-1.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none ">
        Side button
      </div>
    </div>
  );
};

export default CellActionBar;
