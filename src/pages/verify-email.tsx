/* eslint-disable @typescript-eslint/no-explicit-any */
import MainLayout from '@/layouts/MainLayout';
import type { NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { VerifyEmailRequestDTO } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { Api, selectUser, setTokenAuthAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Index = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { email, token } = router.query;
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user?.email_verified) {
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [user]);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const api: Api = new Api();
        const verifyEmailRequestDTO: VerifyEmailRequestDTO = new VerifyEmailRequestDTO(email as string, token as string);
        const response: NormalizedResponseDTO<string> = await api.verifyEmail(verifyEmailRequestDTO);
        const jwtToken: string = response.data;
        dispatch(setTokenAuthAction(jwtToken));
        localStorage.setItem('jwt', jwtToken);
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => {
        router.push('/');
      }, 2000);
    };

    if (email && email.length > 0 && token && token.length > 0) {
      verifyEmail();
    }
  }, [email, token]);

  return <>Verifying...</>;
};

Index.layout = MainLayout;

export default Index;
