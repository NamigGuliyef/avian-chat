import React from 'react';
import ChatWidget from '@/components/chat-widget/ChatWidget';
import { useChat } from '@/contexts/ChatContext';

const WidgetDemo: React.FC = () => {
  const { receiveWidgetMessage } = useChat();

  const handleSendMessage = (message: string, triggerId?: string) => {
    console.log('Message sent:', message, 'Trigger:', triggerId);
    // Send message to admin panel in real-time
    receiveWidgetMessage(message, triggerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sample Website Content */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Mədəniyyət və Turizm Nazirliyi</h1>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="hover:underline">Əsas</a>
            <a href="#" className="hover:underline">Haqqımızda</a>
            <a href="#" className="hover:underline">Xidmətlər</a>
            <a href="#" className="hover:underline">Əlaqə</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Xoş gəlmisiniz!
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            Bu səhifədə canlı dəstək chat widget-ini test edə bilərsiniz.
            Sağ altdakı mavi düyməyə klikləyərək chat-ı açın.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-primary font-medium">
              💡 Widget-dən mesaj göndərdikdə, mesaj avtomatik olaraq Admin Panelə düşəcək.
              Bunu test etmək üçün iki tab açın - birində widget, digərində admin panel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Widget Xüsusiyyətləri</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Quick buttons ilə sürətli seçim
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Real-time mesajlaşma
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Trigger sistemi
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Responsiv dizayn
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Admin Panel</h3>
              <p className="text-muted-foreground mb-4">
                Mesajları idarə etmək üçün admin panelinə keçin.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Admin Panelə Keç
              </a>
            </div>
          </div>
        </div>
      </main>

      <ChatWidget onSendMessage={handleSendMessage} />
    </div>
  );
};

export default WidgetDemo;
