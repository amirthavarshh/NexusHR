import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Building2, Users } from 'lucide-react';

interface Department {
    id: number;
    departmentName: string;
    description: string;
    managerId: number;
    assistantId: number;
}

export const DepartmentDashboard: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await api.getAllDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to load departments:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading departments...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Departments</h2>
                </div>
                {isAdmin && (
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium">
                        Add Department
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                    <div key={dept.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{dept.departmentName}</h3>
                        <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">{dept.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Mgr ID: {dept.managerId || 'Unassigned'}
                            </span>
                            {isAdmin && (
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                                    Manage
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
