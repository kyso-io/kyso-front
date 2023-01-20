/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.log(error);
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log({ error, errorInfo });
  }

  render() {
    // Check if the error is thrown
    if ((this.state as any).hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <div
            className="flex flex-col bg-white lg:relative"
            style={{
              height: '100vh',
            }}
          >
            <div className="flex grow flex-col">
              <main className="flex grow flex-col bg-white">
                <div className="mx-auto flex w-full max-w-7xl grow flex-col px-6 lg:px-8">
                  <div className="shrink-0 pt-10 sm:pt-16">
                    <a href="/" className="inline-flex">
                      <span className="sr-only">Your Company</span>
                      <img className="h-12 mr-2" style={{ display: 'inline' }} src={`/assets/images/kyso-logo-and-name-dark.svg`} alt="Kyso Logo" />
                    </a>
                  </div>
                  <div className="my-auto shrink-0 py-16 sm:py-32">
                    <p className="text-base font-semibold text-indigo-600"></p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Unexpected error</h1>
                    <p className="mt-2 text-base text-gray-500">Sorry, we ran in an unexpected error, we will solve it as soon as possible.</p>
                    <div className="mt-6">
                      <a href="#" className="text-base font-medium text-indigo-600 hover:text-indigo-500">
                        Go back home
                        <span aria-hidden="true"> &rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
              </main>
              <footer className="shrink-0 bg-gray-50">
                <div className="mx-auto w-full max-w-7xl py-16 px-6 lg:px-8">
                  <nav className="flex space-x-4">
                    <a href="/feedback" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                      Contact Support
                    </a>
                    {/* <span className="inline-block border-l border-gray-300" aria-hidden="true" />
                  <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                    Status
                  </a>
                  <span className="inline-block border-l border-gray-300" aria-hidden="true" />
                  <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                    Twitter
      </a> */}
                  </nav>
                </div>
              </footer>
            </div>
            <div className="hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-1/2">
              <img className="absolute inset-0 h-full w-full object-cover" src={`/assets/images/ai_koala.jpg`} alt="" />
            </div>
          </div>
        </>
      );
    }

    // Return children components in case of no error
    return (this.props as any).children;
  }
}

export default ErrorBoundary;
