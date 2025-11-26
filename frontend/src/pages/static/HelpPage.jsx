import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Mail, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import SupportChatWidget from '@/components/support/SupportChatWidget';

const HelpPage = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const faqs = [
        {
            question: "Is SkillSwap really free?",
            answer: "Yes! Our core mission is to make skill sharing accessible to everyone. You can list skills, search for others, and arrange exchanges completely for free."
        },
        {
            question: "How do I arrange an exchange?",
            answer: "Once you find a skill you're interested in, click the 'Request Exchange' button. You'll be able to propose one of your own skills in return. If the other user accepts, you can chat to arrange the details."
        },
        {
            question: "What if I don't have any skills to teach?",
            answer: "Everyone has something to teach! It doesn't have to be academic. You can teach a language, cooking, gardening, or even video games. Think about what you're passionate about."
        },
        {
            question: "Is my personal information safe?",
            answer: "Absolutely. We take privacy seriously. Your contact details are never shared publicly. You only share what you're comfortable with in the secure chat after an exchange is accepted."
        },
        {
            question: "Can I cancel an exchange?",
            answer: "Yes, you can cancel a pending request at any time. If an exchange is already accepted, please communicate with your partner before cancelling out of courtesy."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Help Center
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        Frequently asked questions and support.
                    </p>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                <div className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still need help?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Our support team is just a click away.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/contact">
                            <Button variant="outline" className="flex items-center justify-center w-full sm:w-auto">
                                <Mail className="w-4 h-4 mr-2" /> Email Support
                            </Button>
                        </Link>
                        <Button
                            className="flex items-center justify-center w-full sm:w-auto"
                            onClick={() => setIsChatOpen(true)}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" /> Live Chat
                        </Button>
                    </div>
                </div>
            </div>

            <SupportChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-gray-900 dark:text-white">{question}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 pb-4 text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {answer}
                </div>
            )}
        </div>
    );
};

export default HelpPage;
