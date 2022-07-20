import { useAppDispatch } from '@/hooks/redux-hooks';
import KysoTopBar from '@/layouts/KysoTopBar';
import { logoutAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const Page = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const doLogout = async () => {
      const token = localStorage.getItem('jwt');
      if (token && token.length > 0) {
        await dispatch(logoutAction());
        localStorage.removeItem('jwt');
        localStorage.removeItem('shownVerifiedAlert');
      }
      router.push('/login?logout=true');
    };
    doLogout();
  }, []);

  return (
    <div className="">
      <div className="">
        <h2>Logging you out.</h2>
      </div>
    </div>
  );
};

Page.layout = KysoTopBar;

export default Page;