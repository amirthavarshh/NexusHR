import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Megaphone, AlertCircle, Calendar } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    description: string;
    targetAudience: string;
    priority: string;
    createdAt: string;
    expiryDate: string;
}

export const AnnouncementBoard: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await api.getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to load announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading announcements...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <Megaphone className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Company Announcements</h2>
            </div>
            
            {announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No active announcements at this time.
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div 
                            key={announcement.id} 
                            className={`p-4 rounded-lg border-l-4 ${
                                announcement.priority === 'HIGH' ? 'border-red-500 bg-red-50' :
                                announcement.priority === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50' :
                                'border-blue-500 bg-blue-50'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">{announcement.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    announcement.priority === 'HIGH' ? 'bg-red-200 text-red-800' :
                                    announcement.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-blue-200 text-blue-800'
                                }`}>
                                    {announcement.priority}
                                </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{announcement.description}</p>
                            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                                </span>
                                {announcement.expiryDate && (
                                    <span className="flex items-center gap-1 text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        Valid until: {new Date(announcement.expiryDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
