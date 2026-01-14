import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAudio } from "@/lib/stores/useAudio";

interface AudioControlProps {
  className?: string;
  variant?: "default" | "floating" | "minimal" | "navbar";
  showVolumeSlider?: boolean;
  responsive?: boolean;
}

export function AudioControl({ 
  className = "", 
  variant = "floating", 
  showVolumeSlider = true,
  responsive = true
}: AudioControlProps) {
  const { isMuted, volume, toggleMute, setVolume } = useAudio();

  const getVariantStyles = () => {
    const baseResponsive = responsive ? "w-8 h-8 sm:w-10 sm:h-10" : "w-10 h-10";
    
    switch (variant) {
      case "floating":
        return `fixed top-3 right-3 sm:top-4 sm:right-4 z-50 bg-navy-900/80 backdrop-blur-md border-white/10 hover:bg-navy-800/90 hover:border-gold-500/50 text-white shadow-lg ${baseResponsive}`;
      case "minimal":
        return `bg-white/5 hover:bg-white/10 border-white/10 hover:border-gold-500/50 text-slate-400 hover:text-gold-400 ${baseResponsive}`;
      case "navbar":
        return `bg-white/5 hover:bg-white/10 border-white/10 hover:border-gold-500/50 text-slate-400 hover:text-gold-400 ${baseResponsive}`;
      default:
        return `bg-navy-900/50 hover:bg-navy-800 border-white/20 hover:border-gold-500/50 text-white ${baseResponsive}`;
    }
  };

  const getVolumeIcon = () => {
    const iconSize = responsive ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5";
    if (isMuted || volume === 0) return <VolumeX className={iconSize} />;
    if (volume < 0.5) return <Volume1 className={iconSize} />;
    return <Volume2 className={iconSize} />;
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    
    // If volume is set to 0, mute. If volume > 0 and was muted, unmute
    if (volumeValue === 0 && !isMuted) {
      toggleMute();
    } else if (volumeValue > 0 && isMuted) {
      toggleMute();
    }
  };

  if (!showVolumeSlider) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className={`rounded-full transition-all duration-200 ${getVariantStyles()} ${className}`}
            >
              {getVolumeIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? "Unmute" : "Mute"} sounds</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full transition-all duration-200 ${getVariantStyles()} ${className}`}
              >
                {getVolumeIcon()}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Audio controls</p>
          </TooltipContent>
        </Tooltip>
        
        <PopoverContent 
          className="w-40 sm:w-48 bg-navy-800 border-white/20 text-white" 
          align="end"
          sideOffset={8}
        >
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Audio</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-white/10"
              >
                {getVolumeIcon()}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Status</span>
              <span className={isMuted ? "text-red-400" : "text-green-400"}>
                {isMuted ? "Muted" : "Playing"}
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}