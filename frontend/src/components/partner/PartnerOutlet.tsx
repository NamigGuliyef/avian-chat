import { Outlet } from "react-router-dom";
import PartnerSidebar from "./PartnerSidebar";

const PartnerOutlet = () => {
    return (
        <div className="flex h-screen w-full bg-[#f8fafc]">
            <PartnerSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto py-6 px-4 md:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default PartnerOutlet;
