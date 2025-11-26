const TermsPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        By accessing and using SkillSwap ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        SkillSwap provides a platform for users to connect and exchange skills. We do not provide the skills themselves, nor do we employ the users. We are a facilitator of the connection between users.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Conduct</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        You agree to use the Platform only for lawful purposes. You are prohibited from posting on or transmitting through the Platform any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, sexually explicit, profane, hateful, racially, ethnically, or otherwise objectionable.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We reserve the right to terminate your access to the Platform if you violate these terms.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Disclaimer of Warranties</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        The Platform is provided on an "as is" and "as available" basis. SkillSwap makes no representations or warranties of any kind, express or implied, as to the operation of the Platform or the information, content, materials, or products included on the Platform.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Limitation of Liability</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        SkillSwap shall not be liable for any damages of any kind arising from the use of the Platform, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
