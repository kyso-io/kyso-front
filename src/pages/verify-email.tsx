/* eslint-disable @typescript-eslint/no-explicit-any */
import NoLayout from '@/layouts/NoLayout';
import { useRouter } from 'next/router';
import { selectUser, verifyEmailAction } from '@kyso-io/kyso-store';
import { VerifyEmailRequestDTO } from '@kyso-io/kyso-model';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Index = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { email, token } = router.query;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { text: errorText } = useSelector((state: any) => state.error);
  const user = useSelector(selectUser);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (user?.email_verified || verified) {
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [user, verified]);

  useEffect(() => {
    verifyEmailAction(new VerifyEmailRequestDTO(email as string, token as string));
    const verifyEmail = async () => {
      const result = await dispatch(verifyEmailAction(new VerifyEmailRequestDTO(email as string, token as string)) as any);
      if (result?.payload) {
        setVerified(true);
      }
    };

    if (email && email.length > 0 && token && token.length > 0) {
      verifyEmail();
    }
  }, [email, token]);

  useEffect(() => {
    if (errorText) {
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [errorText, user]);

  return <>Verifying...</>;
};

Index.layout = NoLayout;

export default Index;
