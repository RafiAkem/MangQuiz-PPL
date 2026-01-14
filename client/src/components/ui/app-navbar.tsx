import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppNavbarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBackClick?: () => void;
  onHomeClick?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function AppNavbar({
  title = "MangQuiz",
  subtitle,
  showBackButton = false,
  showHomeButton = false,
  onBackClick,
  onHomeClick,
  rightContent,
  className
}: AppNavbarProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/');
    }
  };

  return (
    <nav className={cn(
      "relative z-40 border-b border-white/5 bg-navy-950/90 backdrop-blur-xl",
      className
    )}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-400 rounded-lg flex items-center justify-center font-bold text-navy-950 text-xl shadow-lg">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white">{title}</span>
              {subtitle && <span className="text-xs text-slate-400 font-medium">{subtitle}</span>}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="navy-ghost"
                size="sm"
                onClick={handleBackClick}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}

            {showHomeButton && (
              <Button
                variant="navy-ghost"
                size="sm"
                onClick={handleHomeClick}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}

            {/* Custom Right Content */}
            {rightContent}
          </div>
        </div>
      </div>
    </nav>
  );
}