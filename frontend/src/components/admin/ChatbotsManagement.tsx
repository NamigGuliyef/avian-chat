import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bot, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

import { getCompanies } from "@/api/admin";
import {
  Chatbot,
  createChatbot,
  deleteChatbot,
  getAllChatbots,
  updateChatbot
} from "@/api/chatbot";
import { ICompany } from "@/types/types";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";



const ChatbotsManagement: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChatbotName, setNewChatbotName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<ICompany[]>([])
  const navigate = useNavigate()
  /* ======================================================
     FETCH CHATBOTS
  ====================================================== */

  useEffect(() => {
    fetchChatbots();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      getCompanies().then(setCompanies)
    }
  }, [isDialogOpen])

  const fetchChatbots = async () => {
    try {
      setLoading(true);
      const data = await getAllChatbots();
      setChatbots(data);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     ACTIONS
  ====================================================== */

  const handleToggle = async (bot: Chatbot) => {
    const updated = !bot.isActive;

    setChatbots((prev) =>
      prev.map((b) => (b._id === bot._id ? { ...b, isActive: updated } : b))
    );

    await updateChatbot(bot._id, { isActive: updated });
  };

  const handleDelete = async (id: string) => {
    await deleteChatbot(id);
    setChatbots((prev) => prev.filter((bot) => bot._id !== id));
  };

  const handleCreateNew = async () => {
    if (!newChatbotName.trim()) return;

    await createChatbot({
      name: newChatbotName,
      companyId,
      isActive: true,
    }).then((created) => {
      setChatbots((prev) => [...prev, created]);
      setNewChatbotName("");
      setIsDialogOpen(false);
    })
  };

  /* ======================================================
     LIST VIEW
  ====================================================== */

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Chatbots</h1>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          New chatbot
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full py-2 mt-6">
          <thead>
            <th>
              <td>Status</td>
            </th>
            <th>
              <td>Şirkət adı</td>
            </th>
            <th>
              <td>Bot adı</td>
            </th>
          </thead>
          <tbody>
            {chatbots
              .filter((bot) =>
                bot.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((bot) => (
                <tr
                  key={bot._id}
                  className="border-b hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`${bot._id}`)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={bot.isActive}
                      onCheckedChange={() => handleToggle(bot)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">{bot.companyId.name}</td>
                  <td className="px-6 py-4 font-medium">{bot.name}</td>
                  {/* <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(bot._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && chatbots.length === 0 && (
          <div className="py-20 text-center">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p>No chatbots yet</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chatbot</DialogTitle>
          </DialogHeader>

          <Label>Chatbot Name</Label>
          <Input
            value={newChatbotName}
            onChange={(e) => setNewChatbotName(e.target.value)}
          />
          <div>
            <Label>Select a company</Label>
            <Select
              value={companyId}
              onValueChange={(value) => setCompanyId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Şirkət seçin..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((f) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNew}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotsManagement;
