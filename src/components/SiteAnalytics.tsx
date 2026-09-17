import { Analytics } from '@vercel/analytics/react';
import type { BeforeSendEvent } from '@vercel/analytics/react';
import { useLocation } from 'react-router-dom';

const productionHosts = new Set(['www.goodbai.baby', 'goodbai.baby']);

function pageViewsOnly(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== 'pageview') return null;
  const url = new URL(event.url);
  if (url.pathname === '/pv') return null;
  // Tool text and files never enter analytics. Also omit URL query/hash values.
  url.search = '';
  url.hash = '';
  return { ...event, url: url.toString() };
}

export default function SiteAnalytics() {
  const { pathname } = useLocation();
  if (!import.meta.env.PROD || !productionHosts.has(window.location.hostname)) {
    return null;
  }

  return (
    <Analytics
      route={pathname}
      path={pathname}
      beforeSend={pageViewsOnly}
      debug={false}
    />
  );
}
