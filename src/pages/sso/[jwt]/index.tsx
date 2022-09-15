import NoLayout from '@/layouts/NoLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Index = () => {
  const router = useRouter();
  const { jwt } = router.query;

  useEffect(() => {
    if (jwt) {
      localStorage.setItem('jwt', jwt as string);

      setTimeout(() => {
        router.push('/');
      }, 200);
    }
  }, [jwt]);

  return <>Logging...</>;
};

Index.layout = NoLayout;

export default Index;
