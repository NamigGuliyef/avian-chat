import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Bot, Settings, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative container mx-auto px-6 py-16">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">LiveChat</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/widget">
                <Button variant="ghost">Widget Demo</Button>
              </Link>
              <Link to="/user">
                <Button variant="outline">User Panel</Button>
              </Link>
              <Link to="/admin">
                <Button className="bg-primary hover:bg-primary/90">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              MVP V1 - Live Chat System
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Canlı Dəstək üçün <br/>
              <span className="text-primary">Güclü Chat Sistemi</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Müştərilərinizlə real-time əlaqə qurun. Chat widget, admin panel və 
              multi-company dəstəyi ilə tam təchiz edilmiş həll.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/widget">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Widget-i Test Et
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/user">
                <Button size="lg" variant="outline">
                  User Panel
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="secondary">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Əsas Xüsusiyyətlər</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              MVP V1-də mövcud olan funksionallıqlar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="Chat Widget"
              description="Saytınıza əlavə edilə bilən göz oxşayan chat widget"
            />
            <FeatureCard
              icon={Users}
              title="Admin Inbox"
              description="Whelp stilində 3-panelli inbox interfeysi"
            />
            <FeatureCard
              icon={Bot}
              title="Trigger Sistemi"
              description="Quick buttons ilə avtomatik yönləndirmə"
            />
            <FeatureCard
              icon={Shield}
              title="Multi-Company"
              description="Çox şirkətli struktur dəstəyi"
            />
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-8 text-center">
            <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-4">Demo Məlumatları</h3>
            <p className="text-muted-foreground mb-6">
              Panellərə daxil olmaq üçün aşağıdakı məlumatlardan istifadə edin:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left max-w-sm mx-auto space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Chat/Admin Panel:</p>
                <p className="text-sm">
                  <code className="text-foreground">admin@culture.gov.az / demo123</code>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">User Panel (CRM):</p>
                <p className="text-sm">
                  <code className="text-foreground">user@culture.gov.az / demo123</code>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <Link to="/user">
                <Button variant="outline">
                  Chat Agent Panel
                </Button>
              </Link>
              <Link to="/user/login">
                <Button variant="outline">
                  User Panel (CRM)
                </Button>
              </Link>
              <Link to="/admin">
                <Button className="bg-primary hover:bg-primary/90">
                  Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>LiveChat MVP V1 © 2024. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
