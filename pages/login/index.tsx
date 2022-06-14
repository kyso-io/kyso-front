import { LoginProviderEnum, User } from '@kyso-io/kyso-model';
import { AppDispatch, loginAction, selectUser } from '@kyso-io/kyso-store';
import { unwrapResult } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';

const LoginPage = () => {
  useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user: User = useAppSelector(selectUser);
  const [email, setUsername] = useState<string>('lo+rey@dev.kyso.io');
  const [password, setPassword] = useState<string>('n0tiene');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const resultLoginAction: AppDispatch = await dispatch(loginAction({ email, password, provider: LoginProviderEnum.KYSO, payload: null }));
    const token: string = unwrapResult(resultLoginAction);
    if (!token || token.length === 0) {
      return;
    }
    localStorage.setItem('jwt', token);
    router.replace('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e: any) => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
