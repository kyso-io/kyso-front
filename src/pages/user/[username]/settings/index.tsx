import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { useEffect } from 'react';
import { useRedirectIfNoJWT } from '../../../../hooks/use-redirect-if-no-jwt';

const Index = () => {
  useRedirectIfNoJWT();

  useEffect(() => {}, []);

  return <p>profile</p>;
};

Index.layout = KysoApplicationLayout;

export default Index;
