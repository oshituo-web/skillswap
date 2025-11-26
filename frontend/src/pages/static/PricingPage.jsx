import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Button from '@/components/ui/Button';

const PricingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400 mb-16">
                    SkillSwap is committed to keeping education accessible. That's why our core features are free, forever.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Tier */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-500 transform scale-105 z-10">
                        <div className="p-8 bg-indigo-600">
                            <h3 className="text-2xl font-bold text-white mb-2">Community</h3>
                            <p className="text-indigo-100">For everyone getting started</p>
                            <div className="mt-6 flex items-baseline justify-center">
                                <span className="text-5xl font-extrabold text-white">$0</span>
                                <span className="text-xl text-indigo-100 ml-2">/month</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <ul className="space-y-4 text-left">
                                <FeatureItem text="Unlimited Skill Searches" included={true} />
                                <FeatureItem text="Create 1 Profile" included={true} />
                                <FeatureItem text="List up to 5 Skills" included={true} />
                                <FeatureItem text="Unlimited Exchanges" included={true} />
                                <FeatureItem text="Community Reviews" included={true} />
                                <FeatureItem text="Basic Support" included={true} />
                            </ul>
                            <div className="mt-8">
                                <Link to="/register">
                                    <Button className="w-full py-3 text-lg shadow-lg">Get Started Free</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tier (Placeholder) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                        <div className="p-8 bg-gray-50 dark:bg-gray-750">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
                            <p className="text-gray-500 dark:text-gray-400">For power users</p>
                            <div className="mt-6 flex items-baseline justify-center">
                                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$9</span>
                                <span className="text-xl text-gray-500 dark:text-gray-400 ml-2">/month</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <ul className="space-y-4 text-left">
                                <FeatureItem text="Everything in Free" included={true} />
                                <FeatureItem text="Verified Badge" included={true} />
                                <FeatureItem text="Priority Search Listing" included={true} />
                                <FeatureItem text="Advanced Analytics" included={true} />
                                <FeatureItem text="Priority Support" included={true} />
                            </ul>
                            <div className="mt-8">
                                <Button variant="outline" className="w-full py-3" disabled>Coming Soon</Button>
                            </div>
                        </div>
                    </div>
                    {/* Enterprise Tier (Placeholder) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                        <div className="p-8 bg-gray-50 dark:bg-gray-750">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team</h3>
                            <p className="text-gray-500 dark:text-gray-400">For organizations</p>
                            <div className="mt-6 flex items-baseline justify-center">
                                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$49</span>
                                <span className="text-xl text-gray-500 dark:text-gray-400 ml-2">/month</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <ul className="space-y-4 text-left">
                                <FeatureItem text="Everything in Pro" included={true} />
                                <FeatureItem text="Team Management" included={true} />
                                <FeatureItem text="Custom Branding" included={true} />
                                <FeatureItem text="API Access" included={true} />
                                <FeatureItem text="Dedicated Account Manager" included={true} />
                            </ul>
                            <div className="mt-8">
                                <Button variant="outline" className="w-full py-3" disabled>Coming Soon</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text, included }) => (
    <li className="flex items-center">
        {included ? (
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
        ) : (
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                <X className="w-3 h-3 text-red-600 dark:text-red-400" />
            </div>
        )}
        <span className="text-gray-600 dark:text-gray-300">{text}</span>
    </li>
);

export default PricingPage;
