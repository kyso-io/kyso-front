import NoLayout from '@/layouts/NoLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import decode from 'jwt-decode';
import type { DecodedToken } from '@/types/decoded-token';

const Index = () => {
  const router = useRouter();
  const { jwt } = router.query;

  useEffect(() => {
    if (jwt) {
      localStorage.setItem('jwt', jwt as string);
      const jwtToken: DecodedToken = decode<DecodedToken>(jwt as string);

      setTimeout(() => {
        if (jwtToken.payload.show_onboarding) {
          router.push('/overview');
        } else {
          router.push('/');
        }
      }, 200);
    }
  }, [jwt]);

  return <>Logging...</>;
};

Index.layout = NoLayout;

export default Index;
