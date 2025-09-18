import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Trophy, Users, Target, LogOut, Settings, User, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/NotificationBell";
import { useState } from "react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleStartChallenge = () => {
    if (user) {
      navigate('/challenges');
    } else {
      navigate('/auth');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={handleLogoClick}
          className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            ChallengeYourself
          </h1>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/challenges" className="text-muted-foreground hover:text-foreground transition-colors">
            Challenges
          </a>
          <a href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
            Community
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                    ChallengeYourself
                  </h2>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  <Button 
                    variant="ghost" 
                    className="justify-start text-left"
                    onClick={() => handleMobileNavClick('/challenges')}
                  >
                    Challenges
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start text-left"
                    onClick={() => handleMobileNavClick('/community')}
                  >
                    Community
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start text-left"
                    onClick={() => handleMobileNavClick('#how-it-works')}
                  >
                    How it Works
                  </Button>
                </nav>

                {user ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.display_name || user.email} />
                        <AvatarFallback>
                          {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.user_metadata?.display_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="ghost" 
                        className="justify-start text-left"
                        onClick={() => handleMobileNavClick('/dashboard')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start text-left"
                        onClick={() => handleMobileNavClick('/profile')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start text-left text-red-600"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start" onClick={handleSignIn}>
                      Sign In
                    </Button>
                    <Button variant="hero" className="w-full" onClick={handleStartChallenge}>
                      Start Challenge
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Button variant="hero" onClick={handleStartChallenge}>Start Challenge</Button>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.display_name || user.email} />
                      <AvatarFallback>
                        {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.display_name || 'User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
              <Button variant="hero" onClick={handleStartChallenge}>Start Challenge</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;