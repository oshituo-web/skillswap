import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Create a new account</h2>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Registration is currently disabled for this demo.
        </p>
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;