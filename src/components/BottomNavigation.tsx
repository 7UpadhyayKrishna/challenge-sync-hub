import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Users, User, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/",
      show: true
    },
    {
      id: "challenges",
      label: "Challenges",
      icon: Target,
      path: "/challenges",
      show: true
    },
    {
      id: "community",
      label: "Community",
      icon: Users,
      path: "/community",
      show: true
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Trophy,
      path: "/dashboard",
      show: !!user
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
      show: !!user
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems
          .filter(item => item.show)
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 touch-manipulation
                  ${active 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${active ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
