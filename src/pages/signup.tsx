/* eslint-disable @typescript-eslint/no-explicit-any */
import PureNotification from '@/components/PureNotification';
import NoLayout from '@/layouts/NoLayout';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faBitbucket, faGithub, faGitlab, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, Login, LoginProviderEnum, SignUpDto } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { Api, setTokenAuthAction, setError as storeSetError } from '@kyso-io/kyso-store';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { KysoDescription } from '../components/KysoDescription';
import { usePublicSettings } from '../hooks/use-public-settings';

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
  ]);
  const { invitation, redirect } = router.query;
  const [email, setEmail] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const [bitbucketUrl, setBitbucketUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [gitlabUrl, setGitlabUrl] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [enableGoogleAuth, setEnableGoogleAuth] = useState(true);
  const [enableGithubAuth, setEnableGithubAuth] = useState(true);
  const [enableGitlabAuth, setEnableGitlabAuth] = useState(true);
  const [enableBitbucketAuth, setEnableBitbucketAuth] = useState(true);
  const [enableKysoAuth, setEnableKysoAuth] = useState(true);
  const [enablePingSamlAuth, setEnablePingSamlAuth] = useState(true);
  const [enableOktaSamlAuth, setEnableOktaSamlAuth] = useState<boolean>(true);
  const [pingUrl, setPingUrl] = useState('');
  const [oktaUrl, setOktaUrl] = useState<string>('');
  const [isKysoOpen, openKysoButton] = useState(false);

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
      setNotificationType('danger');
      setNotification('Email is required');
      setError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setNotificationType('danger');
      setNotification('Email not valid.');
      setError('Email not valid.');
      return;
    }
    if (!password || password.length === 0) {
      setNotificationType('danger');
      setNotification('Password is required');
      setError('Password is required.');
      return;
    }
    if (!repeatPassword || repeatPassword.length === 0) {
      setNotificationType('danger');
      setNotification('Repeat password is required');
      setError('Repeat password is required.');
      return;
    }
    if (password !== repeatPassword) {
      setNotificationType('danger');
      setNotification('Passwords do not match');
      setError('Passwords do not match.');
      return;
    }
    if (!nickname || nickname.length === 0) {
      setNotificationType('danger');
      setNotification('Username is required.');
      setError('Username is required.');
      return;
    }
    if (!displayName || displayName.length === 0) {
      setNotificationType('danger');
      setNotification('Name is required.');
      setError('Name is required.');
      return;
    }
    try {
      const api: Api = new Api();
      const signUpDto: SignUpDto = new SignUpDto(email, nickname, displayName, password);
      await api.signup(signUpDto);
      sessionStorage.setItem('alertMessage', 'You have been registered successfully. A verification link has been sent to your email account.');

      if (redirect) {
        sessionStorage.setItem('redirectUrl', redirect as string);
      }

      const login: Login = new Login(password, LoginProviderEnum.KYSO, email, {});
      const response: NormalizedResponseDTO<string> = await api.login(login);
      const token: string = response.data;
      dispatch(setTokenAuthAction(token));
      localStorage.setItem('jwt', token);
      router.push(`/captcha${invitation ? `?invitation=${invitation as string}` : ''}`);
    } catch (e: any) {
      const errorData: { statusCode: number; message: string; error: string } = e.response.data;
      setNotificationType('danger');
      setNotification(errorData.message);
      setError(errorData.message);
    }
  };

  return (
    <>
      <Head>
        <title> Kyso | Signup </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="w-full min-h-full flex flex-col">
        <div className="border-b p-4 flex flex-row items-center justify-between">
          <img className="h-8 theme-left-logo" alt="Left logo" />
          <img className="h-8 theme-right-logo" alt="Right logo" />
        </div>
        <div className="text-right">{notification && <PureNotification message={notification} type={notificationType} />}</div>
        <main className="flex lg:flex-row lg:space-y-0 space-y-4 flex-col mt-20 items-center mx-auto max-w-[1400px] space-x-10">
          <KysoDescription />

          <div className="prose min-w-[400px] flex flex-col space-y-2 mx-auto border border-gray-400 rounded bg-gray-50 p-12">
            <h2 className="my-0 mb-1">Sign up to Kyso</h2>

            {enableKysoAuth && (
              <>
                {!isKysoOpen && (
                  <button
                    className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50 text-bold text-gray-900"
                    onClick={() => openKysoButton(!isKysoOpen)}
                  >
                    <img src="/favicon.ico" alt="PingID Logo" className="w-4 h-4 inline m-0 mr-1" />
                    Sign up with kyso
                  </button>
                )}
                {isKysoOpen && (
                  <form className="flex flex-col space-y-2 mb-5" method="post" action={`/api/login`} onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Email
                      </label>
                      <input
                        className="mb-1 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
                        aria-label="Email"
                        type="text"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setError('');
                          setNotification('');
                          dispatch(storeSetError(''));
                          setEmail(e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nickname">
                        Full name
                      </label>
                      <input
                        className="mb-1 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
                        aria-label="name"
                        type="text"
                        name="name"
                        value={displayName}
                        onChange={(e) => {
                          setError('');
                          setNotification('');
                          dispatch(storeSetError(''));
                          setDisplayName(e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nickname">
                        Username
                      </label>
                      <input
                        className="mb-1 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
                        aria-label="username"
                        type="text"
                        name="nickname"
                        value={nickname}
                        onChange={(e) => {
                          setError('');
                          setNotification('');
                          dispatch(storeSetError(''));
                          setNickname(e.target.value.toLowerCase());
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Password
                      </label>
                      <input
                        className="mb-2 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
                        value={password}
                        name="password"
                        type="password"
                        autoComplete="off"
                        onChange={(e) => {
                          setError('');
                          setNotification('');
                          dispatch(storeSetError(''));
                          setPassword(e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Repeat password
                      </label>
                      <input
                        className="mb-5 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
                        value={repeatPassword}
                        name="repeatPpassword"
                        type="password"
                        autoComplete="off"
                        onChange={(e) => {
                          setError('');
                          setNotification('');
                          dispatch(storeSetError(''));
                          setRepeatPassword(e.target.value);
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="login-btn shadow-sm text-white k-bg-primary k-bg-primary-hover focus:ring-indigo-900r focus:ring-offset-2 inline-block rounded p-2 text-sm no-underline text-center text-bold"
                    >
                      Register
                    </button>
                  </form>
                )}
                {isKysoOpen && (
                  <>
                    <div className="pt-3 mx-auto w-12/12 " />
                    <button
                      className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50 text-bold text-gray-900"
                      onClick={() => openKysoButton(!isKysoOpen)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}

            {!isKysoOpen && (
              <>
                <div className="pt-2 mx-auto w-6/12 border-b" />
                <div className="pt-1 mx-auto w-12/12 " />
                {enableGithubAuth && githubUrl && githubUrl.length > 0 && (
                  <a href={githubUrl} className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50">
                    <FontAwesomeIcon
                      style={{
                        marginRight: 8,
                      }}
                      icon={faGithub}
                    />
                    Sign up with Github
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
                    Sign up with Bitbucket
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
                    Sign up with Gitlab
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
                    Sign up with Google
                  </a>
                )}

                {enablePingSamlAuth && pingUrl && pingUrl.length > 0 && (
                  <a className="bg-white border flex border-gray-400  items-center justify-center rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50" href={pingUrl}>
                    <img src="/pingid_logo.jpg" alt="PingID Logo" className="w-4 h-4 inline m-0 mr-1" />
                    Sign up with PingID
                  </a>
                )}

                {enableOktaSamlAuth && oktaUrl && oktaUrl.length > 0 && (
                  <a className="bg-white border flex border-gray-400  items-center justify-center rounded p-2.5 text-sm no-underline text-center hover:bg-gray-50" href={oktaUrl}>
                    <img src="/okta_logo.png" alt="Okta Logo" className="w-7 h-4 inline m-0 mr-1" />
                    Sign in with Okta
                  </a>
                )}
              </>
            )}
            {error && <div className="text-red-500 text-center text-xs p-2">{error}</div>}
            <div className="pt-5 flex flex-row items-center shown-div ">
              <p className="text-sm mr-5">Already have an account?</p>
              <a className="text-sm no-underline hover:none text-indigo-600 hover:text-indigo-700" href={`/login${invitation ? `?invitation=${invitation}` : ''}`}>
                Log in now
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
