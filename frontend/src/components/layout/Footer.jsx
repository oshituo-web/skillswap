import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">SkillSwap</span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Exchange skills, not money. Join our community of learners and teachers today.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li><Link to="/marketplace" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Browse Skills</Link></li>
                            <li><Link to="/how-it-works" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">How it Works</Link></li>
                            <li><Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/help" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Help Center</Link></li>
                            <li><Link to="/terms" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-white">
                                <Github className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-white">
                                <Twitter className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-white">
                                <Linkedin className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-between items-center">
                    <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
