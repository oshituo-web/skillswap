import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const SettingsPage = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
                This page is under construction.
            </p>
            <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
        </div>
    );
};

export default SettingsPage;
