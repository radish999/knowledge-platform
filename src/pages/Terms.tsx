import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Service Description',
    body: [
      'Radish Music provides audio browsing, search, playback, and related metadata display features through the service available at goodbai.baby and related app experiences.',
    ],
  },
  {
    title: '2. Acceptable Use',
    body: [
      'You agree not to misuse the service, interfere with its operation, attempt unauthorized access, or use the service in violation of applicable law.',
    ],
  },
  {
    title: '3. Third-Party Content',
    body: [
      'Some music, artwork, and metadata may come from third-party sources. Availability and licensing of such content are controlled by their respective providers, and we do not guarantee uninterrupted access to that content.',
    ],
  },
  {
    title: '4. Intellectual Property',
    body: [
      'The website, interface, brand assets, and app logic belong to us or our licensors. Third-party tracks and artwork remain subject to their own rights holders and license terms.',
    ],
  },
  {
    title: '5. Disclaimer',
    body: [
      'The service is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted availability, complete accuracy, or fitness for every specific use case.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service.',
    ],
  },
  {
    title: '7. Changes',
    body: [
      'We may update these terms from time to time. Continued use of the service after an update takes effect constitutes acceptance of the revised terms.',
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

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-800 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Last updated: April 2, 2026
        </p>
        <p className="mt-6 text-base leading-8 text-gray-700 dark:text-gray-300">
          These Terms of Service govern your access to and use of Radish Music services provided
          through
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
            to="/privacy"
            className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            Read Privacy Policy
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
