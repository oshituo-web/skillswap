const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        We collect information you provide directly to us, such as when you create an account, create a profile, or communicate with us. This information may include your name, email address, and any other information you choose to provide.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        We use the information we collect to provide, maintain, and improve our services, such as to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                        <li>Create and maintain your account;</li>
                        <li>Connect you with other users for skill exchanges;</li>
                        <li>Send you technical notices, updates, security alerts, and support messages;</li>
                        <li>Respond to your comments, questions, and requests.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Sharing of Information</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We do not share your personal information with third parties except as described in this policy. We may share your information with other users as part of the skill exchange process (e.g., your profile information).
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Contact Us</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at privacy@skillswap.com.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPage;
