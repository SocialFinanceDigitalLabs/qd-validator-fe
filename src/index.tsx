import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import { Loader } from '@sfdl/sf-mui-components';
import { withCookieGate } from '@sfdl/sf-cookie-gate';
import { Tool } from 'Router';

const App = lazy(() => {
  return import('./App');
});

const Landing = lazy(() => {
  return import('./Landing');
});

const Core = () => {
  const CookieGate = withCookieGate({
    options: { cookieName: 'my-cookie', cookieOptions: {} },
    LandingComponent: Landing,
    ApplicationComponent: App,
  });

  return (
    <Suspense fallback={<Loader type='cover' />}>
      <CookieGate
        APIName={'Using: Pyodide'}
        tool={tool}
        wheelPath={wheelPath}
      />
    </Suspense>
  );
};

const rootEl = document.getElementById('root') as HTMLElement;

// set some sensible defaults, in case we bail on attribute selection
const tool = rootEl.getAttribute('data-tool') || Tool.Tool903;
const wheelPath =
  rootEl.getAttribute('data-wheelpath') ||
  '/bin/dist/lac_validator-1.0.3-py3-none-any.whl';

const root = ReactDOM.createRoot(rootEl);

root.render(
  <React.StrictMode>
    <Core />
  </React.StrictMode>
);
