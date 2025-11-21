import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, UserCircle, Zap } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            <Zap className="w-6 h-6 mr-2" />
            SkillSwap
          </Link>
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Welcome, {user.email}
                </span>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <LayoutDashboard className="w-5 h-5 inline-block mr-1" />
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <UserCircle className="w-5 h-5 inline-block mr-1" />
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="flex items-center text-red-500 hover:text-red-700">
                  <LogOut className="w-5 h-5 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Log In
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;