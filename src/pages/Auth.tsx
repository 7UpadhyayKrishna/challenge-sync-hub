import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Target } from 'lucide-react';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Target className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              ChallengeHub
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Transform Your Life in{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                30 Days
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-lg">
              Join collaborative challenges, track your progress, and achieve your goals 
              with friends. Start your transformation journey today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">125K+</div>
              <div className="text-sm text-muted-foreground">Challenges Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">89%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex justify-center">
          <AuthForm onSuccess={handleAuthSuccess} />
        </div>
      </div>
    </div>
  );
};

export default Auth;