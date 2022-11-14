export const KysoDescription = () => {
  return (
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
  );
};
