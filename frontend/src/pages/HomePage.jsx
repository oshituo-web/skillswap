import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight, Shield, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
            The #1 Community for Skill Exchange
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
            Exchange Skills, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Not Money.
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Master new skills by trading your expertise. Find a coding mentor, a language tutor, or a cooking pro in our global community.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                Browse Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose SkillSwap?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              We've built a platform that makes skill sharing easy, safe, and rewarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
              title="Learn Anything"
              description="From web development to pottery, find an expert willing to trade their knowledge for yours."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-purple-600" />}
              title="Flexible Time"
              description="Arrange lessons or exchange sessions at times that work perfectly for both parties."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-pink-600" />}
              title="Community Driven"
              description="Connect with passionate individuals. Build your network and make new friends."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-green-600" />}
              title="Verified Users"
              description="Our review system ensures you're connecting with trusted and reliable community members."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-600" />}
              title="Instant Matching"
              description="Find the perfect skill match in seconds with our advanced search and filtering tools."
            />
            <FeatureCard
              icon={<ArrowRight className="w-8 h-8 text-blue-600" />}
              title="Grow Together"
              description="Track your progress, earn badges, and level up your skills with your exchange partners."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to start your learning journey?</h2>
          <p className="text-indigo-100 text-lg mb-10">
            Join thousands of users who are already exchanging skills and growing together.
          </p>
          <Link to="/register">
            <button className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-xl shadow-lg hover:bg-gray-50 transition-colors transform hover:scale-105 duration-200">
              Join SkillSwap Now
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
      {description}
    </p>
  </div>
);

export default HomePage;
