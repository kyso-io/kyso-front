import { useAppDispatch } from '@/hooks/redux-hooks';
import { logoutAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';

const Page = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const doLogout = async () => {
      const token: string | null = localStorage.getItem('jwt');
      if (token && token.length > 0) {
        await dispatch(logoutAction());
        localStorage.removeItem('jwt');
        localStorage.removeItem('shownVerifiedAlert');
      }
      router.replace('/login');
    };
    doLogout();
  }, []);

  return <div></div>;
};

Page.layout = MainLayout;

export default Page;
