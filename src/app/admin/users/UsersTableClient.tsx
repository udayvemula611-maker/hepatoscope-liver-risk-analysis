'use client';

import { useState } from 'react';
import CreateUserModal from '@/components/CreateUserModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

type User = {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    assigned_doctor?: string;
};

export default function UsersTableClient({ initialUsers }: { initialUsers: User[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loadingAssignment, setLoadingAssignment] = useState<string | null>(null);

    const doctors = users.filter(u => u.role === 'doctor');

    const handleAssignDoctor = async (patientId: string, doctorId: string) => {
        setLoadingAssignment(patientId);
        try {
            const res = await fetch('/api/users/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId || null })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUsers(users.map(u =>
                u.id === patientId ? { ...u, assigned_doctor: doctorId || undefined } : u
            ));
            toast.success(data.message);
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign doctor');
        } finally {
            setLoadingAssignment(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#1E3A8A]">All Users ({initialUsers.length})</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#152b66] transition-colors shadow-sm text-sm"
                >
                    + Create User
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Dr.</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-gray-900">{u.full_name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        u.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {u.role === 'patient' ? (
                                        <select
                                            disabled={loadingAssignment === u.id}
                                            value={u.assigned_doctor || ''}
                                            onChange={(e) => handleAssignDoctor(u.id, e.target.value)}
                                            className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {doctors.map(d => (
                                                <option key={d.id} value={d.id}>{d.full_name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-gray-400 text-sm">—</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {u.created_at.split('T')[0]}
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/users/${u.id}`} className="text-sm text-[#3B82F6] hover:text-[#1E3A8A] font-medium mr-3 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                                        View Profile
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { }} doctors={doctors} />
        </div>
    );
}
