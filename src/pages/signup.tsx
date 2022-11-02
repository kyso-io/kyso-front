/* eslint-disable @typescript-eslint/no-explicit-any */
import PureNotification from '@/components/PureNotification';
import { Helper } from '@/helpers/Helper';
import NoLayout from '@/layouts/NoLayout';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faBitbucket, faGithub, faGitlab, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NormalizedResponseDTO, SignUpDto } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, Login, LoginProviderEnum } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { Api, setError as storeSetError, setTokenAuthAction } from '@kyso-io/kyso-store';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import uuid from 'uuid';

const validateEmail = (email: string) => {
  /* eslint-disable no-useless-escape */
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const githubScopes = ['read:user', 'user:email', 'read:org', 'repo', 'admin:repo_hook', 'public_repo'];

const Index = () => {
  const router = useRouter();

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
  const [pingUrl, setPingUrl] = useState('');

  const [rightLogo, setRightLogo] = useState(null);
  const [leftLogo, setLeftLogo] = useState('/assets/images/kyso-logo-and-name-dark.svg');

  const [globalCss, setglobalCss] = useState(false);
  const [headerCss, setHeaderCss] = useState(false);
  const [buttonCss, setButtonCss] = useState(false);
  const [buttonHoverCss, setButtonHoverCss] = useState(false);
  const [linkCss, setLinkCss] = useState(false);
  const [showdivCss, setShowdivCss] = useState(false);
  const [hiddendivCss, setHiddendivCss] = useState(false);
  const [isKysoOpen, openKysoButton] = useState(false);

  useEffect(() => {
    const getOrganizationOptions = async () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const publicKeys: any[] = await Helper.getKysoPublicSettings();

      if (!publicKeys || publicKeys.length === 0) {
        // return toaster.danger("An unknown error has occurred");
        return '';
      }

      const googleClientId = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_GOOGLE_CLIENT_ID).value;
      const bitbucketClientId = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_BITBUCKET_CLIENT_ID).value;
      const githubClientId = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_GITHUB_CLIENT_ID).value;
      const gitlabClientId = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_GITLAB_CLIENT_ID).value;
      const gitlabRedirectURI = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_GITLAB_REDIRECT_URI).value;
      const pingIdSamlSSOUrl = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_PINGID_SAML_SSO_URL).value;

      const tmpEnableGoogleAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GOOGLE).value === 'true';

      const tmpEnableGithubAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GITHUB).value === 'true';

      const tmpEnableGitlabAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GITLAB).value === 'true';

      const tmpEnableBitbucketAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_BITBUCKET).value === 'true';

      const tmpEnableKysoAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_KYSO).value === 'true';

      const tmpEnablePingSamlAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_PINGID_SAML).value === 'true';

      setGoogleUrl(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&response_type=code&redirect_uri=${encodeURIComponent(
          `${window.location.origin}/oauth/google/callback`,
        )}&scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/user.emails.read')}`,
      );
      setBitbucketUrl(`https://bitbucket.org/site/oauth2/authorize?client_id=${bitbucketClientId}&response_type=code`);

      setGithubUrl(`https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=${githubScopes.join(',')}&state=${uuid ? uuid.v4() : ''}`);

      setGitlabUrl(`https://gitlab.com/oauth/authorize?client_id=${gitlabClientId}&redirect_uri=${gitlabRedirectURI}&response_type=code`);

      setPingUrl(pingIdSamlSSOUrl);

      setEnableGoogleAuth(tmpEnableGoogleAuth);
      setEnableGitlabAuth(tmpEnableGitlabAuth);
      setEnableGithubAuth(tmpEnableGithubAuth);
      setEnableBitbucketAuth(tmpEnableBitbucketAuth);
      setEnableKysoAuth(tmpEnableKysoAuth);
      setEnablePingSamlAuth(tmpEnablePingSamlAuth);

      const custumizeLeftLogo = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_LEFT_LOGO_URL).value;
      const custumizeRightLogo = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_RIGHT_LOGO_URL).value;

      if (custumizeLeftLogo) {
        setLeftLogo(custumizeLeftLogo);
      }
      if (custumizeRightLogo) {
        setRightLogo(custumizeRightLogo);
      }

      const customizeGlobalCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_CSS_STYLES).value;
      const customizeHeaderCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_HEADER_CSS_STYLES)?.value;
      const customizeButtonCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_BUTTON_CSS_STYLES)?.value;
      const customizeButtonHoverCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_BUTTON_HOVER_CSS_STYLES)?.value;
      const customizeLinkCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_LINK_CSS_STYLES)?.value;
      const customizeShowdivCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_SHOWDIV_CSS_STYLES)?.value;
      const customizeHiddendivCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_HIDDENDIV_CSS_STYLES)?.value;
      setglobalCss(customizeGlobalCss);
      setHeaderCss(customizeHeaderCss);
      setButtonCss(customizeButtonCss);
      setButtonHoverCss(customizeButtonHoverCss);
      setLinkCss(customizeLinkCss);
      setShowdivCss(customizeShowdivCss);
      setHiddendivCss(customizeHiddendivCss);

      return '';
    };
    getOrganizationOptions();
  }, []);

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
      const signUpDto: SignUpDto = {
        email,
        username: nickname,
        display_name: displayName,
        password,
      };
      await api.signup(signUpDto);
      setNotificationType('success');
      setNotification('You have been registered successfully. A verification link has been sent to your email account.');
      setTimeout(async () => {
        const login: Login = new Login(password, LoginProviderEnum.KYSO, email, {});
        const response: NormalizedResponseDTO<string> = await api.login(login);
        const token: string = response.data;
        dispatch(setTokenAuthAction(token));
        localStorage.setItem('jwt', token);
        router.push('/captcha');
      }, 1000);
      setError('');
      setEmail('');
      setPassword('');
      setNickname('');
      setDisplayName('');
    } catch (e: any) {
      const errorData: { statusCode: number; message: string; error: string } = e.response.data;
      setNotificationType('danger');
      setNotification(errorData.message);
      setError(errorData.message);
    }
  };

  /* const responseGoogle = async (response: any) => {
    if (!response) {
      // toaster.danger("There was an error authenticating the user with Google.");
      return;
    }
    if (response?.error) {
      // toaster.danger(response.details || response.error);
      return;
    }

    const result = await dispatch(
      loginAction({
        email: "",
        password: response.tokenId,
        provider: "google",
        payload: { ...response },
      })
    );
    if (result?.payload) {
      localStorage.setItem("jwt", result.payload);
    } else {
      // toaster.danger("There was an error authenticating the user with google.");
    }
  }; */

  return (
    <>
      <Head>
        <title> Kyso | Signup </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="w-full min-h-full flex flex-col">
        {(leftLogo || rightLogo) && (
          <div className="border-b p-4 flex flex-row items-center justify-between">
            {leftLogo && <img src={leftLogo} className="h-8" alt="logo" />}
            {rightLogo && <img src={rightLogo} className="h-8" alt="logo" />}
          </div>
        )}
        <div className="text-right">{notification && <PureNotification message={notification} type={notificationType} />}</div>
        <main className="flex lg:flex-row lg:space-y-0 space-y-4 flex-col mt-20 items-center mx-auto max-w-[1400px] space-x-10">
          <div className="prose grow max-w-none px-6 m-0">
            <h1 className="login-header text-2xl font-bold text">Kyso.io</h1>
            <p>Kyso.io offers free unlimited (private) repositories and unlimited collaborators.</p>
            <ul>
              <li>
                <a className="login-link" href="https://docs.kyso.io" aria-label="docs" target="_blank" rel="noopener noreferrer">
                  Read Kyso documentation
                </a>
              </li>
              <li style={{ paddingTop: '5px' }}>
                <a className="login-link" href="https://docs.kyso.io/posting-to-kyso/kyso-command-line-tool/installation" aria-label="cli" target="_blank" rel="noopener noreferrer">
                  Install Kyso CLI
                </a>
              </li>
              <li style={{ paddingTop: '5px' }}>
                <a className="login-link" href="https://about.kyso.io/about" aria-label="about" target="_blank" rel="noopener noreferrer">
                  More information about Kyso
                </a>
              </li>
            </ul>
            <div className="hidden-div">
              <div>
                <p>By signing up for and by signing in to this service you accept our:</p>
                <ul>
                  <li>
                    <a className="login-link" href="https://about.kyso.io/terms" aria-label="terms" target="_blank" rel="noopener noreferrer">
                      Terms of service
                    </a>
                  </li>
                  <li>
                    <a className="login-link" href="https://about.kyso.io/privacy" aria-label="privacy" target="_blank" rel="noopener noreferrer">
                      Privacy statement
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

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
                      className="login-btn shadow-sm text-white bg-kyso-600 hover:bg-kyso-700 focus:ring-indigo-900r focus:ring-offset-2 inline-block rounded p-2 text-sm no-underline text-center text-bold"
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
              </>
            )}
            {error && <div className="text-red-500 text-center text-xs p-2">{error}</div>}
            <div className="pt-5 flex flex-row items-center shown-div ">
              <p className="text-sm mr-5">Already have an account?</p>
              <a className="text-sm no-underline hover:none text-indigo-600 hover:text-indigo-700" href="/login">
                Log in now
              </a>
            </div>
          </div>
        </main>
        <style jsx global>{`
          html * {
            ${globalCss};
          }
          .login-header {
            ${headerCss}
          }
          .login-btn {
            ${buttonCss};
          }
          .login-btn:hover {
            ${buttonHoverCss}
          }
          .login-link {
            ${linkCss};
          }
          .shown-div {
            ${showdivCss}
          }
          .hidden-div {
            ${hiddendivCss}
          }
        `}</style>
      </div>
    </>
  );
};

Index.layout = NoLayout;

export default Index;
