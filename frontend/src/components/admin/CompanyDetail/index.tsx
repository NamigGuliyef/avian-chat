import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ICompany } from '@/types/types';
import {
    ArrowLeft,
    Folder
} from 'lucide-react';
import React from 'react';
import ProjectsTab from './ProjectsTab';

interface CompanyDetailProps {
    company: ICompany;
    onBack: () => void;
}

// Mock projects data

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack }) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">{company.name}</h2>
                    <p className="text-sm text-muted-foreground">{company.domain}</p>
                </div>
            </div>

            {/* Tabs - Only Channels and Users */}
            <Tabs defaultValue="projects" className="w-full">
                <TabsList className="mb-6">
                    {/* <TabsTrigger value="channels" className="gap-2">
                        <Radio className="w-4 h-4" />
                        Kanallar
                    </TabsTrigger> */}
                    {/* <TabsTrigger value="users" className="gap-2">
                        <Users className="w-4 h-4" />
                        İstifadəçilər
                    </TabsTrigger> */}
                    <TabsTrigger value="projects" className="gap-2">
                        <Folder className="w-4 h-4" />
                        Layihələr
                    </TabsTrigger>
                </TabsList>

                {/* Channels Tab */}
                {/* <TabsContent value="channels">
                    <ChannelsTabs companyId={company._id} />
                </TabsContent> */}

                {/* Users Tab */}
                {/* <TabsContent value="users">
                    <UsersTab companyId={company._id} />
                </TabsContent> */}

                {/* Projects Tab - Updated with proper project cards */}
                <TabsContent value="projects">
                    <ProjectsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CompanyDetail;
