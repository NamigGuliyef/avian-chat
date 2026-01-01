import { UserManagement } from '@/components/admin/UserManagement';
import { mockCrmUsers } from '@/data/mockData';
import { useState } from 'react';

export const AdminUsers = () => {
    const [users, setUsers] = useState(mockCrmUsers);
    return <UserManagement users={users} onUsersChange={setUsers} />;
};
