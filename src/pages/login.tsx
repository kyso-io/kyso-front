import { Helper } from '@/helpers/Helper';
import NoLayout from '@/layouts/NoLayout';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faBitbucket, faGithub, faGitlab, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { KysoSettingsEnum, Login, LoginProviderEnum } from '@kyso-io/kyso-model';
import type { AppDispatch } from '@kyso-io/kyso-store';
import { loginAction, setError as storeSetError } from '@kyso-io/kyso-store';
import { useUser } from '@/hooks/use-user';
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
  const { redirect } = router.query;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
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

  const [rightLogo, setRightLogo] = useState(null);
  const [leftLogo, setLeftLogo] = useState(null);

  /* eslint-disable unused-imports/no-unused-vars */
  const [globalCss, setglobalCss] = useState(false);
  const [headerCss, setHeaderCss] = useState(false);
  const [buttonCss, setButtonCss] = useState(false);
  const [buttonHoverCss, setButtonHoverCss] = useState(false);
  const [linkCss, setLinkCss] = useState(false);
  const [showdivCss, setShowdivCss] = useState(false);
  const [hiddendivCss, setHiddendivCss] = useState(false);

  // To pass for now the eslint ...
  console.log(`${globalCss} ${headerCss} ${buttonCss} ${buttonHoverCss} ${linkCss} 
    ${showdivCss} ${hiddendivCss} ${error}`);

  // const user = useSelector(selectUser);
  const user = useUser();

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

      const customizeGlobalCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_CSS_STYLES).value;

      const customizeHeaderCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_HEADER_CSS_STYLES)?.value;

      const customizeButtonCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_BUTTON_CSS_STYLES)?.value;
      const customizeButtonHoverCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_BUTTON_HOVER_CSS_STYLES)?.value;
      const customizeLinkCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_LINK_CSS_STYLES)?.value;
      const customizeShowdivCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_SHOWDIV_CSS_STYLES)?.value;
      const customizeHiddendivCss = publicKeys.find((x) => x.key === KysoSettingsEnum.CUSTOMIZE_LOGIN_HIDDENDIV_CSS_STYLES)?.value;

      setLeftLogo(custumizeLeftLogo);
      setRightLogo(custumizeRightLogo);

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

  useEffect(() => {
    if (user) {
      // toaster.success("You are now logged in.");

      setTimeout(() => {
        if (user.show_captcha) {
          if (redirect) {
            router.push(`/captcha?redirect=${redirect}`);
          } else {
            router.push(`/captcha`);
          }
        } else if (redirect) {
          router.push(redirect as string);
        } else {
          router.push('/');
        }
      }, 200);
    }
  }, [user]);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

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
      localStorage.setItem('jwt', result.payload);
      setTimeout(() => {
        if (redirect) {
          router.push(redirect as string);
        } else {
          router.push('/');
        }
      }, 200);
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
        <title> Kyso | Login </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-full bg-white pt-2">
        {(leftLogo || rightLogo) && (
          <div className="pb-4 grid grid-cols-3 gap-4 mb-4 border-b-[1px] border-[#dbdbdb] border-solid">
            <div className="pl-4">
              {/* Left logo */}
              {leftLogo && <img src={leftLogo} alt="logo" />}
            </div>
            <div className="pl-[45%]">
              {/* Center logo */}
              {/* {rightLogo && <img src={rightLogo} alt="logo" />} */}
            </div>
            <div className="pl-[87%]">
              {/* Right logo */}
              {rightLogo && <img src={rightLogo} alt="logo" />}
            </div>
          </div>
        )}

        <main className="pb-8 pt-24">
          <div className="mx-10">
            {/* Main 3 column grid */}
            <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="section-1-title">
                  <div className="">
                    <div className="p-6 prose">
                      {/* Your content */}
                      <div>
                        <h1>Kyso.io</h1>
                        {/* <a href="/">
                          <img className="w-24" src={`/assets/images/kyso-logo-and-name-dark.svg`} alt="Kyso" />
                        </a> */}
                        <p
                          className="py-4"
                          style={{
                            WebkitFontSmoothing: 'antialiased',
                            textRendering: 'optimizeLegibility',
                          }}
                        >
                          Kyso.io offers free unlimited (private) repositories and unlimited collaborators.
                        </p>
                        <ul className="list-disc list-inside pl-4 pb-4">
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
                          {/* <li style={{ paddingTo5: '7px'}}>
                              <a className="login-link" href="https://about.kyso.io/blog" aria-label="blog" target="_blank" rel="noopener noreferrer">
                                Read our blog
                              </a>
                              </li> */}
                        </ul>
                        <div className="pb-4">
                          <p className="pb-4">By signing up for and by signing in to this service you accept our:</p>
                          <ul className="list-disc list-inside pl-4">
                            <li style={{ paddingTop: '5px' }}>
                              <a className="login-link" href="https://about.kyso.io/terms" aria-label="terms" target="_blank" rel="noopener noreferrer">
                                Terms of service
                              </a>
                            </li>
                            <li style={{ paddingTop: '5px' }}>
                              <a className="login-link" href="https://about.kyso.io/privacy" aria-label="privacy" target="_blank" rel="noopener noreferrer">
                                Privacy statement
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right column */}
              <div className="grid grid-cols-1 gap-4 prose">
                <h2>Sign in to Kyso</h2>

                {enableKysoAuth && (
                  <form className="flex flex-col space-y-4" method="post" action={`/api/login`} onSubmit={handleSubmit}>
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
                    <a className="text-xs no-underline hover:underline" href="/reset-password">
                      Forgot your password?
                    </a>
                    <button type="submit" className="border inline-block rounded p-2.5 text-sm no-underline text-center text-bold">
                      Log in now
                    </button>
                  </form>
                )}

                <div className="my-6 mx-auto w-6/12 border-b" />

                {enableGithubAuth && githubUrl && githubUrl.length > 0 && (
                  <a href={githubUrl} className="border inline-block rounded p-2.5 text-sm no-underline text-center">
                    <FontAwesomeIcon
                      style={{
                        marginRight: 8,
                      }}
                      icon={faGithub}
                    />
                    Log in with Github
                  </a>
                )}

                {enableBitbucketAuth && bitbucketUrl && bitbucketUrl.length > 0 && (
                  <a className="border inline-block rounded p-2.5 text-sm no-underline text-center" href={bitbucketUrl}>
                    <FontAwesomeIcon
                      style={{
                        marginRight: 8,
                      }}
                      icon={faBitbucket}
                    />
                    Log in with Bitbucket
                  </a>
                )}

                {enableGitlabAuth && gitlabUrl && gitlabUrl.length > 0 && (
                  <a className="border inline-block rounded p-2.5 text-sm no-underline text-center" href={gitlabUrl}>
                    <FontAwesomeIcon
                      style={{
                        marginRight: 8,
                      }}
                      icon={faGitlab}
                    />
                    Log in with Gitlab
                  </a>
                )}

                {enableGoogleAuth && googleUrl && googleUrl.length > 0 && (
                  <a className="border inline-block rounded p-2.5 text-sm no-underline text-center" href={googleUrl}>
                    <FontAwesomeIcon
                      style={{
                        marginRight: 8,
                      }}
                      icon={faGoogle}
                    />
                    Log in with Google
                  </a>
                )}

                {enablePingSamlAuth && pingUrl && pingUrl.length > 0 && (
                  <a className="border flex items-center justify-center rounded p-2.5 text-sm no-underline text-center" href={pingUrl}>
                    <img src="/pingid_logo.jpg" className="w-4 h-4 inline m-0 mr-1" />
                    Log in with PingID
                  </a>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

Index.layout = NoLayout;

export default Index;
