import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      'We may collect limited information that is necessary to operate and improve the service, including device details, app version, runtime logs, crash logs, and the content you actively submit through feedback or contact channels.',
      'When you use playback and search related features, the service may also process track selections, playback status, progress, and search keywords to provide core music functionality.',
    ],
  },
  {
    title: '2. How We Use Information',
    body: [
      'We use information to provide playback, search, and content browsing features, improve stability and performance, diagnose errors, and respond to your support requests.',
      'We do not sell your personal information.',
    ],
  },
  {
    title: '3. Third-Party Services',
    body: [
      'The app may rely on public third-party music services such as Jamendo to retrieve tracks, artwork, and metadata. Requests sent to those services are subject to their own privacy practices.',
      'Relevant service: Jamendo, https://www.jamendo.com, Privacy Policy: https://www.jamendo.com/privacy',
    ],
  },
  {
    title: '4. Permissions',
    body: [
      'The app may request network permission to load online tracks and related media. Audio-related permissions may be requested only where required by functionality or platform compatibility.',
      'Permissions are used only within the scope necessary for the relevant feature.',
    ],
  },
  {
    title: '5. Sharing and Disclosure',
    body: [
      'We do not publicly disclose or transfer personal information except where necessary to provide core service functionality, where required by law, or where you have explicitly consented.',
    ],
  },
  {
    title: '6. Data Security',
    body: [
      'We take reasonable technical and organizational measures to protect data from unauthorized access, alteration, disclosure, or loss. However, no internet-based system can be guaranteed to be completely secure.',
    ],
  },
  {
    title: '7. Your Rights',
    body: [
      'Subject to applicable law, you may request access to, correction of, or deletion of information we process about you, and you may contact us with privacy-related questions.',
    ],
  },
  {
    title: '8. Contact',
    body: [
      'Operator: Radish Music',
      'Website: https://www.goodbai.baby/',
      'Contact Email: radishmengpig@gmail.com',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-800 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Last updated: April 2, 2026
        </p>
        <p className="mt-6 text-base leading-8 text-gray-700 dark:text-gray-300">
          This Privacy Policy explains how Radish Music collects, uses, stores, and protects
          information when you access services provided through
          {' '}
          <a
            href="https://www.goodbai.baby/"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            goodbai.baby
          </a>
          .
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-gray-700 dark:text-gray-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-8 dark:border-gray-700">
          <Link
            to="/terms"
            className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            Read Terms of Service
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
