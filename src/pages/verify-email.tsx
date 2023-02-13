/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helper } from '@/helpers/Helper';
import MainLayout from '@/layouts/MainLayout';
import type { NormalizedResponseDTO, UserDTO } from '@kyso-io/kyso-model';
import { VerifyEmailRequestDTO } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { Api, setTokenAuthAction } from '@kyso-io/kyso-store';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';
import type { HttpExceptionDto } from '../interfaces/http-exception.dto';

const Index = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { email, token } = router.query;
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [sentVerificationEmail, setSentVerificationEmail] = useState<boolean>(false);
  const [accountVerified, setAccountVerified] = useState<boolean>(false);
  const [accountAlreadyVerified, setAccountAlreadyVerified] = useState<boolean>(false);
  const [user, setUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    if (!email || !token) {
      return;
    }
    const jwtToken: string | null = getLocalStorageItem('jwt');
    if (!jwtToken) {
      verifyEmail();
      return;
    }
    if (jwtToken) {
      getUser(jwtToken);
    }
  }, [email, token]);

  const getUser = async (jwtToken: string) => {
    try {
      const api: Api = new Api(jwtToken);
      const responseUserDto: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      const u: UserDTO = responseUserDto.data;
      setUser(u);
      if (u.email_verified) {
        setAccountAlreadyVerified(true);
      } else {
        verifyEmail();
      }
    } catch (e) {}
  };

  const verifyEmail = async () => {
    setRequesting(true);
    try {
      const api: Api = new Api();
      const verifyEmailRequestDTO: VerifyEmailRequestDTO = new VerifyEmailRequestDTO(email as string, token as string);
      const response: NormalizedResponseDTO<string> = await api.verifyEmail(verifyEmailRequestDTO);
      const jwtToken: string = response.data;
      dispatch(setTokenAuthAction(jwtToken));
      localStorage.setItem('jwt', jwtToken);
      setAccountVerified(true);
    } catch (e: any) {
      const httpExceptionDto: HttpExceptionDto = e.response.data;
      Helper.logError('Unexpected error', httpExceptionDto);
      setError(httpExceptionDto.message);
    }
    setRequesting(false);
  };

  const sendVerificationEmail = async () => {
    setRequesting(true);
    try {
      const jwtToken: string | null = getLocalStorageItem('jwt');
      const api: Api = new Api(jwtToken);
      await api.sendVerificationEmail();
      setSentVerificationEmail(true);
    } catch (e) {
      Helper.logError('Unexpected error', e);
    }
    setRequesting(false);
  };

  return (
    <div className="flex flex-row space-x-8 p-2 pt-10">
      <div className="w-2/12"></div>
      <div className="w-8/12 flex flex-col space-y-8">
        {(!email || !token) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" x-description="Heroicon name: mini/x-circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Verification link is not valid</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    <Link href="/login" className="font-bold cursor-pointer underline">
                      Log in
                    </Link>{' '}
                    and go to your profile to send another verification link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {!requesting && error && !sentVerificationEmail && (
          <div className="rounded-md bg-yellow-50 p-4 mb-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">{error}</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {user ? (
                    <p>
                      Click{' '}
                      <span onClick={sendVerificationEmail} className="font-bold cursor-pointer underline">
                        here
                      </span>{' '}
                      to receive another verification e-mail.
                    </p>
                  ) : (
                    <p>
                      <Link href="/login" className="font-bold cursor-pointer underline">
                        Log in
                      </Link>{' '}
                      and go to your profile to send another verification link.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {requesting && !error && (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  x-description="Heroicon name: mini/information-circle"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">Verifying your account, please wait...</p>
              </div>
            </div>
          </div>
        )}
        {!accountAlreadyVerified && accountVerified && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-green-400" x-description="Heroicon name: mini/check-circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Your account has been verified</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Go to the{' '}
                    <Link href="/" className="font-bold cursor-pointer underline">
                      home page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {accountAlreadyVerified && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-green-400" x-description="Heroicon name: mini/check-circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Your account is already verified</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Go to the{' '}
                    <Link href="/" className="font-bold cursor-pointer underline">
                      home page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {sentVerificationEmail && (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  x-description="Heroicon name: mini/information-circle"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-700">A verification email has been sent</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>A verification email has been sent to your email address. Please check your inbox and click the link to verify your account.</p>{' '}
                  <p>
                    Go to the{' '}
                    <Link href="/" className="font-bold cursor-pointer underline">
                      home page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Index.layout = MainLayout;

export default Index;
