import ErrorNotification from '@/components/ErrorNotification';
import { Helper } from '@/helpers/Helper';
import NoLayout from '@/layouts/NoLayout';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faBitbucket, faGithub, faGitlab, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NormalizedResponseDTO, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, Login, LoginProviderEnum } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { Api, loginAction, setError as storeSetError } from '@kyso-io/kyso-store';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import uuid from 'uuid';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';

const validateEmail = (email: string) => {
  /* eslint-disable no-useless-escape */
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const githubScopes = ['read:user', 'user:email', 'read:org', 'repo', 'admin:repo_hook', 'public_repo'];

const Index = () => {
  const router = useRouter();
  const { redirect } = router.query;

  const [email, setEmail] = useState(getLocalStorageItem('email') || '');
  // const [error, setError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
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
  const [captchaEnabled, setCaptchaEnabled] = useState<boolean>(true);

  const [rightLogo, setRightLogo] = useState(null);
  const [leftLogo, setLeftLogo] = useState('/assets/images/kyso-logo-and-name-dark.svg');

  // const [globalCss, setglobalCss] = useState(false);
  // const [headerCss, setHeaderCss] = useState(false);
  // const [buttonCss, setButtonCss] = useState(false);
  // const [buttonHoverCss, setButtonHoverCss] = useState(false);
  // const [linkCss, setLinkCss] = useState(false);
  // const [showdivCss, setShowdivCss] = useState(false);
  // const [hiddendivCss, setHiddendivCss] = useState(false);

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

      const tmpEnableBitbucketAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GITLAB).value === 'true';

      const tmpEnableKysoAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GITLAB).value === 'true';

      const tmpEnablePingSamlAuth = publicKeys.find((x) => x.key === KysoSettingsEnum.AUTH_ENABLE_GLOBALLY_GITLAB).value === 'true';

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

      // const customizeGlobalCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_CSS_STYLES).value;
      // const customizeHeaderCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_HEADER_CSS_STYLES)?.value;
      // const customizeButtonCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_BUTTON_CSS_STYLES)?.value;
      // const customizeButtonHoverCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_BUTTON_HOVER_CSS_STYLES)?.value;
      // const customizeLinkCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_LINK_CSS_STYLES)?.value;
      // const customizeShowdivCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_SHOWDIV_CSS_STYLES)?.value;
      // const customizeHiddendivCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_HIDDENDIV_CSS_STYLES)?.value;
      // setglobalCss(customizeGlobalCss);
      // setHeaderCss(customizeHeaderCss);
      // setButtonCss(customizeButtonCss);
      // setButtonHoverCss(customizeButtonHoverCss);
      // setLinkCss(customizeLinkCss);
      // setShowdivCss(customizeShowdivCss);
      // setHiddendivCss(customizeHiddendivCss);

      const captchaEnabledValue: string = publicKeys.find((x) => x.key === KysoSettingsEnum.HCAPTCHA_ENABLED).value;
      setCaptchaEnabled(captchaEnabledValue === 'true');

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

    const loginData: Login = new Login(password, LoginProviderEnum.KYSO, email, {});
    const result = await dispatch(loginAction(loginData));
    if (result?.payload) {
      localStorage.removeItem('email');
      const token: string = result.payload;
      localStorage.setItem('jwt', token);
      // Get user info to check if has completed the captcha challenge
      const api: Api = new Api(token);
      const resultUser: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      const user: UserDTO = resultUser.data;
      setTimeout(() => {
        if (captchaEnabled && user.show_captcha) {
          if (redirect) {
            sessionStorage.setItem('redirectUrl', redirect as string);
          }
          router.push('/captcha');
        } else if (redirect) {
          router.push(redirect as string);
        } else {
          router.push('/');
        }
      }, 200);
    } else {
      setError('Invalid credentials');
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
        <title> Kyso | Signin </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="w-full min-h-full flex flex-col">
        {(leftLogo || rightLogo) && (
          <div className="border-b p-4 flex flex-row items-center justify-between">
            {leftLogo && <img src={leftLogo} className="h-8" alt="logo" />}
            {rightLogo && <img src={rightLogo} className="h-8" alt="logo" />}
          </div>
        )}
        <div className="text-right">{error && <ErrorNotification message={error} />}</div>
        <main className="flex lg:flex-row lg:space-y-0 space-y-4 flex-col mt-20 items-center mx-auto max-w-[1400px] space-x-10">
          <div className="prose grow max-w-none px-6 m-0">
            <h1>Kyso.io</h1>
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

          <div className="prose min-w-[400px] flex flex-col space-y-2 mx-auto border border-gray-400 rounded bg-gray-50 p-12">
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
                    placeholder="Email"
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
                <div className="flex items-center justify-between">
                  <a className="text-xs no-underline hover:none  text-gray-900 hover:text-indigo-600" href="/reset-password">
                    Forgot your password?
                  </a>
                  <a className="text-xs no-underline hover:none  text-gray-900 hover:text-indigo-600" href="/signup">
                    Create an account
                  </a>
                </div>
                <button
                  type="submit"
                  className="shadow-sm text-white bg-kyso-600 hover:bg-kyso-700 focus:ring-indigo-900r focus:ring-offset-2 inline-block rounded p-2 text-sm no-underline text-center text-bold"
                >
                  Sign in
                </button>
              </form>
            )}

            <div className="my-6 mx-auto w-6/12 border-b" />

            {enableGithubAuth && githubUrl && githubUrl.length > 0 && (
              <a href={githubUrl} className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center">
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
              <a className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center" href={bitbucketUrl}>
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
              <a className="bg-white border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center" href={gitlabUrl}>
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
              <a className="bg-white w-full border border-gray-400 inline-block rounded p-2.5 text-sm no-underline text-center" href={googleUrl}>
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
              <a className="bg-white border flex border-gray-400  items-center justify-center rounded p-2.5 text-sm no-underline text-center" href={pingUrl}>
                <img src="/pingid_logo.jpg" alt="PingID Logo" className="w-4 h-4 inline m-0 mr-1" />
                Sign in with PingID
              </a>
            )}

            {error && <div className="text-red-500 text-center p-2">{error}</div>}
          </div>
        </main>
      </div>
    </>
  );
};

Index.layout = NoLayout;

export default Index;
