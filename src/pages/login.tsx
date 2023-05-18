/* eslint-disable @typescript-eslint/no-explicit-any */
import ErrorNotification from '@/components/ErrorNotification';
import NoLayout from '@/layouts/NoLayout';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faBitbucket, faGithub, faGitlab, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NormalizedResponseDTO, Token } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, Login, LoginProviderEnum } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { Api, setTokenAuthAction, setError as storeSetError } from '@kyso-io/kyso-store';
import decode from 'jwt-decode';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { KysoDescription } from '../components/KysoDescription';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';
import { usePublicSettings } from '../hooks/use-public-settings';
import type { DecodedToken } from '../types/decoded-token';

const validateEmail = (email: string) => {
  /* eslint-disable no-useless-escape */
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const githubScopes = ['read:user', 'user:email'];
const gitlabScope = 'read_user';

const Index = () => {
  const router = useRouter();
  const kysoSettingValues: (any | null)[] = usePublicSettings([
    KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GOOGLE, // 0
    KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GITHUB, // 1
    KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GITLAB, // 2
    KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_BITBUCKET, // 3
    KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_KYSO, // 4
    KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_PINGID_SAML, // 5
    KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_OKTA_SAML, // 6
    KysoSettingsEnum.AUTH_GOOGLE_CLIENT_ID, // 7
    KysoSettingsEnum.AUTH_GITHUB_CLIENT_ID, // 8
    KysoSettingsEnum.AUTH_GITLAB_CLIENT_ID, // 9
    KysoSettingsEnum.AUTH_GITLAB_REDIRECT_URI, // 10
    KysoSettingsEnum.AUTH_BITBUCKET_CLIENT_ID, // 11
    KysoSettingsEnum.AUTH_PINGID_SAML_SSO_URL, // 12
    KysoSettingsEnum.AUTH_OKTA_SAML_SSO_URL, // 13
    KysoSettingsEnum.HCAPTCHA_ENABLED, // 14
  ]);
  const { redirect, invitation } = router.query;
  const [email, setEmail] = useState(getLocalStorageItem('email') || '');
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const [bitbucketUrl, setBitbucketUrl] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [gitlabUrl, setGitlabUrl] = useState<string>('');
  const [googleUrl, setGoogleUrl] = useState<string>('');
  const [enableGoogleAuth, setEnableGoogleAuth] = useState<boolean>(true);
  const [enableGithubAuth, setEnableGithubAuth] = useState<boolean>(true);
  const [enableGitlabAuth, setEnableGitlabAuth] = useState<boolean>(true);
  const [enableBitbucketAuth, setEnableBitbucketAuth] = useState<boolean>(true);
  const [enableKysoAuth, setEnableKysoAuth] = useState<boolean>(true);
  const [enablePingSamlAuth, setEnablePingSamlAuth] = useState<boolean>(true);
  const [enableOktaSamlAuth, setEnableOktaSamlAuth] = useState<boolean>(true);
  const [pingUrl, setPingUrl] = useState<string>('');
  const [oktaUrl, setOktaUrl] = useState<string>('');
  const [captchaEnabled, setCaptchaEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (kysoSettingValues.length === 0) {
      return;
    }
    setEnableGoogleAuth(kysoSettingValues[0] === 'true');
    setEnableGithubAuth(kysoSettingValues[1] === 'true');
    setEnableGitlabAuth(kysoSettingValues[2] === 'true');
    setEnableBitbucketAuth(kysoSettingValues[3] === 'true');
    setEnableKysoAuth(kysoSettingValues[4] === 'true');
    setEnablePingSamlAuth(kysoSettingValues[5] === 'true');
    setEnableOktaSamlAuth(kysoSettingValues[6] === 'true');

    setGoogleUrl(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${kysoSettingValues[7]}&response_type=code&redirect_uri=${encodeURIComponent(
        `${window.location.origin}/oauth/google/callback`,
      )}&scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/user.emails.read')}${
        invitation ? `&state=${invitation}` : ''
      }${redirect ? `&state=${redirect}` : ''}`,
    );
    setGithubUrl(
      `https://github.com/login/oauth/authorize?client_id=${kysoSettingValues[8]}&scope=${githubScopes.join(',')}${invitation ? `&state=${invitation}` : ''}${redirect ? `&state=${redirect}` : ''}`,
    );
    setGitlabUrl(
      `https://gitlab.com/oauth/authorize?client_id=${kysoSettingValues[9]}&scope=${gitlabScope}&redirect_uri=${kysoSettingValues[10]}&response_type=code${invitation ? `&state=${invitation}` : ''}${
        redirect ? `&state=${redirect}` : ''
      }`,
    );
    setBitbucketUrl(
      `https://bitbucket.org/site/oauth2/authorize?client_id=${kysoSettingValues[11]}&response_type=code${invitation ? `&state=${invitation}` : ''}${redirect ? `&state=${redirect}` : ''}`,
    );
    setPingUrl(kysoSettingValues[12]);
    setOktaUrl(kysoSettingValues[13]);

    setCaptchaEnabled(kysoSettingValues[14] === 'true');
  }, [router.isReady, kysoSettingValues]);

  useEffect(() => {
    if (router.query.error) {
      setError(router.query.error as string);
    }
  }, [router.query.error]);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!email || email.length === 0) {
      setError('Email is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email not valid.');
      return;
    }

    if (!password || password.length === 0) {
      setError('Password is required.');
      return;
    }

    try {
      const api: Api = new Api();
      const login: Login = new Login(password, LoginProviderEnum.KYSO, email, {});
      const response: NormalizedResponseDTO<string> = await api.login(login);
      localStorage.removeItem('email');
      const token: string = response.data;
      dispatch(setTokenAuthAction(token));
      localStorage.setItem('jwt', token);
      // Get user info to check if has completed the captcha challenge
      const jwtToken: DecodedToken = decode<DecodedToken>(token);
      const user: Token = jwtToken.payload;

      setTimeout(() => {
        const showOnboarding = user.show_onboarding ? user.show_onboarding : false;

        if (captchaEnabled && user.show_captcha) {
          if (redirect) {
            sessionStorage.setItem('redirectUrl', redirect as string);
          }
          router.push(`/captcha${invitation ? `?invitation=${invitation as string}` : ''}`);
        } else if (invitation) {
          router.push(invitation as string);
        } else if (showOnboarding) {
          if (redirect) {
            router.push(redirect as string);
            return;
          }

          let toOverview = `/overview`;

          if (invitation) {
            toOverview = `/overview?invitation=${invitation as string}`;
          }

          router.push(toOverview);
        } else if (redirect) {
          router.push(redirect as string);
        } else {
          router.push('/');
        }
      }, 200);
    } catch (e: any) {
      setError('The server in unavailable. Try again later.');
      const errorResponse: { statusCode: number; message: string; error: string } = e.response.data;
      setError(errorResponse.message);
    }
  };

  return (
    <>
      <Head>
        <title> Kyso | Login </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="w-full min-h-full flex flex-col">
        <div className="invisible lg:visible border-b p-4 lg:flex lg:flex-row items-center justify-between">
          <img className="h-8 k-left-logo" alt="Left logo" />
          <img className="h-8 k-right-logo" alt="Right logo" />
        </div>
        <div className="text-right">{error && <ErrorNotification message={error} />}</div>
        <main className="flex lg:flex-row lg:space-y-0 space-y-4 flex-col lg:mt-20 items-center mx-auto max-w-[1400px] lg:space-x-10">
          <span className="invisible lg:visible">
            <KysoDescription />
          </span>

          <div className="prose lg:min-w-[400px] flex flex-col space-y-2 mx-auto border border-gray-400 rounded bg-gray-50 p-12">
            <h2 className="my-0 mb-1">Sign in to Kyso</h2>

            {enableKysoAuth && (
              <form className="flex flex-col space-y-2" method="post" action={`/api/login`} onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Email
                  </label>
                  <input
                    className="mb-2 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
                    aria-label="Email"
                    type="text"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setError('');
                      dispatch(storeSetError(''));
                      setEmail(e.target.value);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Password
                  </label>

                  <input
                    className="mb-2 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
                    // description="Please enter your password."
                    value={password}
                    name="password"
                    type="password"
                    // placeholder="Password"
                    autoComplete="off"
                    onChange={(e) => {
                      setError('');
                      dispatch(storeSetError(''));
                      setPassword(e.target.value);
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="login-btn shadow-sm text-white k-bg-primary focus:ring-indigo-900r focus:ring-offset-2 inline-block rounded p-2 text-sm no-underline text-center text-bold"
                >
                  Sign in
                </button>
              </form>
            )}

            <div className="mx-auto w-6/12 border-b py-3" />
            <div className="mx-auto w-12/12 pt-3" />

            {enableGithubAuth && githubUrl && githubUrl.length > 0 && (
              <a href={githubUrl} className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50">
                <FontAwesomeIcon
                  style={{
                    marginRight: 8,
                  }}
                  icon={faGithub}
                />
                Sign in with Github
              </a>
            )}

            {enableBitbucketAuth && bitbucketUrl && bitbucketUrl.length > 0 && (
              <a className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50" href={bitbucketUrl}>
                <FontAwesomeIcon
                  style={{
                    marginRight: 8,
                  }}
                  icon={faBitbucket}
                />
                Sign in with Bitbucket
              </a>
            )}

            {enableGitlabAuth && gitlabUrl && gitlabUrl.length > 0 && (
              <a className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50" href={gitlabUrl}>
                <FontAwesomeIcon
                  style={{
                    marginRight: 8,
                  }}
                  icon={faGitlab}
                />
                Sign in with Gitlab
              </a>
            )}

            {enableGoogleAuth && googleUrl && googleUrl.length > 0 && (
              <a className="bg-white w-full border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50" href={googleUrl}>
                <FontAwesomeIcon
                  style={{
                    marginRight: 8,
                  }}
                  icon={faGoogle}
                />
                Sign in with Google
              </a>
            )}

            {enablePingSamlAuth && pingUrl && pingUrl.length > 0 && (
              <a className="bg-white border flex border-gray-400  items-center justify-center rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50" href={pingUrl}>
                <img src="/pingid_logo.jpg" alt="PingID Logo" className="w-4 h-4 inline m-0 mr-1" />
                Sign in with PingID
              </a>
            )}

            {enableOktaSamlAuth && oktaUrl && oktaUrl.length > 0 && (
              <a className="bg-white border flex border-gray-400  items-center justify-center rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50" href={oktaUrl}>
                <img src="/okta_logo.png" alt="Okta Logo" className="w-7 h-4 inline m-0 mr-1" />
                Sign in with Okta
              </a>
            )}

            {error && <div className="text-red-500 text-center text-xs p-2">{error}</div>}
            <div className="pt-5 flex flex-row items-center shown-div ">
              <a className="text-xs no-underline hover:none text-gray-900 hover:text-indigo-700 mr-5" href="/reset-password">
                Forgot your password?
              </a>
              <a className="text-xs ml-14 no-underline hover:none text-gray-900 hover:text-indigo-700" href={redirect ? `/signup?redirect=${redirect}` : `/signup`}>
                Create an account
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

Index.layout = NoLayout;

export default Index;
