import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import ChatInterface from "@/components/ChatInterface";
import ChatHistory from "@/components/ChatHistory";
import ProfilePage from "@/components/ProfilePage";
import SubscriptionPage from "@/components/SubscriptionPage";
import DocumentUpload from "@/components/DocumentUpload";
import { trpc } from "@/lib/trpc";

type TabType = "chat" | "history" | "profile" | "subscription" | "upload";

// Note: Using a custom layout instead of DashboardLayout for this specific use case

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  const { data: subscriptionStatus, isLoading: isSubLoading } = trpc.subscription.getStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated && user),
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;
    if (isSubLoading) return;
    if (subscriptionStatus?.status === "expired") {
      setLocation("/assinatura-expirada");
    }
  }, [loading, isAuthenticated, user, isSubLoading, subscriptionStatus?.status, setLocation]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (isAuthenticated && user && isSubLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>;
  }

  // Navigation items for sidebar
  const navItems = [
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "upload", label: "Upload", icon: "📄" },
    { id: "history", label: "Histórico", icon: "📋" },
    { id: "profile", label: "Perfil", icon: "👤" },
    { id: "subscription", label: "Assinatura", icon: "💳" },
  ];

  // Render sidebar navigation
  const sidebarNav = (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as TabType)}
          className={`w-full text-left px-4 py-2 rounded-lg transition ${
            activeTab === item.id
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="mr-2">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 border-r border-slate-200 p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900">NormaIA</h1>
          <p className="text-sm text-slate-600 mt-1">{user.email}</p>
        </div>
        {sidebarNav}
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          {activeTab === "chat" && <ChatInterface />}
          {activeTab === "upload" && <DocumentUpload />}
          {activeTab === "history" && <ChatHistory />}
          {activeTab === "profile" && <ProfilePage />}
          {activeTab === "subscription" && <SubscriptionPage />}
        </div>
      </main>
    </div>
  );
}
