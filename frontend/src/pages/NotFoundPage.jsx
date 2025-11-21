import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center">
      <h1 className="text-9xl font-black text-gray-200 dark:text-gray-700">404</h1>
      <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Page Not Found
      </p>
      <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div className="mt-10">
        <Link
          to="/"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          &larr; Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;