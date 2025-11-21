import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const AdminLayout = ({ children, title }) => (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="flex items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
            <Link to="/admin">
                <Button size="icon" variant="outline" className="mr-4">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <Card className="p-6">
            <CardContent className="p-0">
                {children}
                <div className="mt-6 text-center">
                    <Link to="/admin">
                        <Button variant="outline">Back to Admin Dashboard</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
);

export const AdminUserManagement = () => (
    <AdminLayout title="User Management">
        <p className="text-lg text-gray-600 dark:text-gray-300">Placeholder: This is where you will find tools to view, search, and edit user profiles.</p>
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 space-y-2">
            <h3 className="font-semibold dark:text-white">Next Features:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-400">
                <li>Search filter for users by email or ID.</li>
                <li>Table listing all user accounts with status and role.</li>
                <li>Option to ban or temporarily suspend users.</li>
            </ul>
        </div>
    </AdminLayout>
);

export const AdminSkillManagement = () => (
    <AdminLayout title="Skill Management">
        <p className="text-lg text-gray-600 dark:text-gray-300">Placeholder: This is where you will define and manage the official skill taxonomy.</p>
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 space-y-2">
            <h3 className="font-semibold dark:text-white">Next Features:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-400">
                <li>Form to add new primary skill categories (e.g., Programming, Music).</li>
                <li>Tool to manage sub-skills (e.g., React, Piano).</li>
                <li>Approval queue for user-submitted skills.</li>
            </ul>
        </div>
    </AdminLayout>
);

export const AdminExchangeModeration = () => (
    <AdminLayout title="Exchange Moderation">
        <p className="text-lg text-gray-600 dark:text-gray-300">Placeholder: This is where you will handle disputes and resolve reported exchanges.</p>
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 space-y-2">
            <h3 className="font-semibold dark:text-white">Next Features:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-400">
                <li>Queue of ongoing or reported exchanges needing review.</li>
                <li>Detailed view of exchange history and user communication.</li>
                <li>Tools to grant/revoke experience points or issue warnings.</li>
            </ul>
        </div>
    </AdminLayout>
);

export const AdminAnalytics = () => (
    <AdminLayout title="Analytics">
        <p className="text-lg text-gray-600 dark:text-gray-300">Placeholder: This section will display key performance indicators and platform metrics.</p>
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 space-y-2">
            <h3 className="font-semibold dark:text-white">Next Features:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-400">
                <li>Total Registered Users vs. Active Users charts.</li>
                <li>Most popular skills being exchanged.</li>
                <li>Geographical distribution of users (if applicable).</li>
            </ul>
        </div>
    </AdminLayout>
);
