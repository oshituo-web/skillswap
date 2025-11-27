import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Home, BookOpen, ShieldCheck, Zap, User } from 'lucide-react';
import Button from '../ui/Button';
import DarkModeToggle from '../ui/DarkModeToggle';
import NotificationBell from '../notifications/NotificationBell';

const Header = () => {
    const { isAuthenticated, signOut, user } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isAdmin = user?.user_metadata?.is_admin;

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: Home, show: true },
        { name: 'Dashboard', path: '/dashboard', icon: BookOpen, show: isAuthenticated && !isAdmin },
        { name: 'Marketplace', path: '/marketplace', icon: Zap, show: isAuthenticated },
        { name: 'Profile', path: `/profile/${user?.id}`, icon: User, show: isAuthenticated },
        { name: 'Admin Panel', path: '/admin', icon: ShieldCheck, show: isAuthenticated && isAdmin },
    ];

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                        <Zap className="w-6 h-6 mr-2" />
                        SkillSwap
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-4">
                        {navLinks.filter(link => link.show).map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive(link.path) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                            >
                                <link.icon className="w-4 h-4 mr-2" />
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth & Actions */}
                    <div className="hidden md:flex items-center space-x-2">
                        <NotificationBell />
                        <DarkModeToggle />
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2 hidden lg:inline">
                                    {user?.email}
                                </span>
                                <Button onClick={handleSignOut} variant="destructive" size="sm">
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="outline">Log In</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <Button size="icon" variant="outline" onClick={toggleMenu} className="md:hidden">
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute w-full bg-white dark:bg-gray-800 shadow-xl border-t border-gray-200 dark:border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.filter(link => link.show).map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.name}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <Button onClick={handleSignOut} variant="destructive" className="w-full justify-start mt-2">
                                <LogOut className="w-5 h-5 mr-3" /> Sign Out
                            </Button>
                        ) : (
                            <div className="pt-2 space-y-2">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Log In</Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
