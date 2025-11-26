import { Link } from 'react-router-dom';
import { UserPlus, Search, ArrowRightLeft, Star, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

const HowItWorksPage = () => {
    const steps = [
        {
            icon: <UserPlus className="w-8 h-8 text-indigo-600" />,
            title: "1. Create Your Profile",
            description: "Sign up and list the skills you can teach. Whether it's coding, cooking, or playing the guitar, everyone has something to offer."
        },
        {
            icon: <Search className="w-8 h-8 text-purple-600" />,
            title: "2. Find a Skill",
            description: "Browse the marketplace to find a skill you want to learn. Filter by category, rating, or user."
        },
        {
            icon: <ArrowRightLeft className="w-8 h-8 text-pink-600" />,
            title: "3. Request an Exchange",
            description: "Propose a skill swap. You teach them your skill, and they teach you theirs. It's a win-win!"
        },
        {
            icon: <Star className="w-8 h-8 text-yellow-600" />,
            title: "4. Learn & Review",
            description: "Connect, learn, and grow. After the exchange, leave a review to help build trust in the community."
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                        How SkillSwap Works
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Join the revolution of skill sharing. It's simple, free, and community-driven.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-white dark:bg-gray-900 border-4 border-gray-50 dark:border-gray-800 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-indigo-100 dark:group-hover:border-indigo-900/30 transition-colors duration-300">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        {step.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-flex rounded-md shadow">
                        <Link to="/register">
                            <Button size="lg" className="px-8 py-4 text-lg">
                                Start Swapping Today <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;
