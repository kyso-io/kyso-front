import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {}, []);

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6"></div>
      <div className="w-4/6">
        <div className="mt-4"></div>
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;
// Index.layout = MainLayout;

export default Index;
