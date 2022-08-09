import KysoApplicationLayout from '@/layouts/KysoApplicationLayout.tsx';
import { addUserAccountAction, loginAction, selectUser, setTokenAuthAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Page = () => {
  const router = useRouter();

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { code, error, provider } = router.query;

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        window.location = `${router.basePath}/login`;
      }, 1000);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        window.location = user.show_captcha ? `${router.basePath}/captcha` : router.basePath;
      }, 200);
    }
  }, [user]);

  useEffect(() => {
    if (!code || code === '') {
      return;
    }
    const makeLogin = async () => {
      const result = await dispatch(
        loginAction({
          email: '',
          password: code,
          provider,
          payload: `${window.location.origin}/oauth/${provider}/callback`,
        }),
      );
      if (result?.payload) {
        localStorage.setItem('jwt', result.payload);
      } else {
        router.replace(`/login?error=${encodeURIComponent('There was an error authenticating the user.')}`);
      }
    };
    const addUserAccount = async () => {
      const jwt = localStorage.getItem('jwt');
      await dispatch(setTokenAuthAction(jwt));
      await dispatch(
        addUserAccountAction({
          code,
          provider,
        }),
      );
      const redirect = sessionStorage.getItem('userAccount');
      sessionStorage.removeItem('userAccount');
      router.replace(redirect);
    };
    const redirect = sessionStorage.getItem('userAccount');
    if (redirect && redirect.length > 0) {
      addUserAccount();
    } else {
      makeLogin();
    }
  }, [code]);

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-slate-50 border py-8 px-4 shadow sm:rounded-lg sm:px-10">loading...</div>
    </div>
  );
};

Page.layout = KysoApplicationLayout;

export default Page;
