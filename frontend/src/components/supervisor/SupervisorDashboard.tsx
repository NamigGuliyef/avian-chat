"use client";

import { getSupervisorAgents } from "@/api/users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

const SupervisorDashboard = () => {
    const [agents, setAgents] = useState<any[]>([]);

    useEffect(() => {
        getSupervisorAgents("69511a96fb49f4fb17d67331").then(setAgents);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Agentlərim</h2>
                <p className="text-muted-foreground">Nəzarət etdiyiniz agentlərin ümumi icmalı</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent, i) => (
                    <motion.div
                        key={agent._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="hover:shadow-xl transition-shadow rounded-2xl">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="font-semibold">
                                        {agent.name[0]}
                                        {agent.surname[0]}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <p className="font-semibold leading-none">
                                        {agent.name} {agent.surname}
                                    </p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        {agent.email}
                                    </div>
                                </div>

                                {agent.onlineStatus === "online" ? (
                                    <Wifi className="h-5 w-5 text-green-500" />
                                ) : (
                                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                                )}
                            </CardHeader>

                            <CardContent className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="capitalize">{agent.status}</Badge>
                                <Badge variant="outline">{agent.role}</Badge>
                                <Badge variant="outline">Projects: {agent.projectIds.length}</Badge>
                                <Badge variant="outline">Channels: {agent.channelIds.length}</Badge>
                                {agent.chatbotEnabled === false && (
                                    <Badge variant="destructive">Chatbot OFF</Badge>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SupervisorDashboard;
