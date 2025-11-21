import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const HomePage = () => {
  return (
    <div className="text-center p-8 bg-white dark:bg-gray-900">
      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
        Exchange Skills, Not Money.
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Find someone to teach you coding, and teach them guitar in return. Welcome to SkillSwap.
      </p>
      <Link to="/register">
        <Button size="lg" className="text-lg px-8 py-3 shadow-xl">
          Get Started Today
        </Button>
      </Link>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <BookOpen className="w-8 h-8 text-indigo-500 mb-2" />
            <CardTitle>Learn Anything</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>From web development to cooking, find an expert willing to trade their knowledge.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Clock className="w-8 h-8 text-indigo-500 mb-2" />
            <CardTitle>Flexible Time</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Arrange lessons or exchange sessions at times that work for both parties.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="w-8 h-8 text-indigo-500 mb-2" />
            <CardTitle>Community Driven</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Connect with passionate individuals in your local or global community.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
