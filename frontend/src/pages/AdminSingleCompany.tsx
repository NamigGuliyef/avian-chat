import { getCompanyById } from '@/api/admin';
import CompanyDetail from '@/components/admin/CompanyDetail';
import { ICompany } from '@/types/types';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminSingleCompany = () => {
    const [company, setCompany] = useState<ICompany>({} as ICompany)
    const { companyId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        getCompanyById(companyId).then((d) => setCompany(d))
    }, [companyId])


    return (
        <CompanyDetail
            company={company}
            onBack={() => navigate(-1)}
        />
    );
};

export default AdminSingleCompany;
