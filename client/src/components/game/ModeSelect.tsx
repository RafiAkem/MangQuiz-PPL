import { useNavigate } from "react-router-dom";
import { Globe, Gamepad2, Swords, Trophy as TrophyIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  badge?: string;
  isLarge?: boolean;
}

function ModeCard({ title, description, icon, color, onClick, badge, isLarge }: ModeCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: -4, y: -4 }}
      whileTap={{ scale: 0.98, x: 0, y: 0 }}
      onClick={onClick}
      className={`relative group w-full text-left bg-[#F2F0E9] border-4 border-[#0D0D0D] p-6 shadow-[8px_8px_0px_0px_#0D0D0D] transition-all hover:shadow-[12px_12px_0px_0px_#0D0D0D] overflow-hidden ${isLarge ? 'md:col-span-2' : ''}`}
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 ${color} opacity-10 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-45`} />
      
      {badge && (
        <div className="absolute top-4 right-4 bg-[#0D0D0D] text-[#F2F0E9] px-2 py-1 text-[10px] font-black uppercase tracking-widest z-10">
          {badge}
        </div>
      )}

      <div className={`w-12 h-12 flex items-center justify-center border-2 border-[#0D0D0D] mb-4 shadow-[4px_4px_0px_0px_#0D0D0D] ${color}`}>
        {icon}
      </div>

      <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">
        {title}
      </h3>
      <p className="text-sm font-bold text-[#0D0D0D]/70 leading-tight uppercase">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest border-b-2 border-[#0D0D0D]">
          Select Mode
        </span>
        <div className="w-8 h-8 flex items-center justify-center border-2 border-[#0D0D0D] bg-[#0D0D0D] text-[#F2F0E9]">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
}

export function ModeSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F2F0E9] p-6 md:p-12 font-mono flex flex-col items-center justify-center">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl relative z-10"
      >
        <header className="mb-12 text-center md:text-left">
          <div className="inline-block bg-[#0022FF] text-[#F2F0E9] px-4 py-2 border-4 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] mb-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              SELECT ARENA
            </h1>
          </div>
          <p className="text-lg font-bold text-[#0D0D0D] uppercase tracking-widest max-w-2xl">
            Choose your battleground. From casual local play to high-stakes global ranked leagues.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModeCard
            title="RANKED LEAGUE"
            description="High-stakes competitive play. Climb the tiers from Plastic to Ether. Global leaderboards."
            icon={<TrophyIcon className="w-6 h-6 text-[#0D0D0D]" />}
            color="bg-[#FF4D4D]"
            badge="LIVE SEASON"
            isLarge={true}
            onClick={() => navigate("/mode/ranked")}
          />
          <ModeCard
            title="ONLINE QUICK"
            description="Battle random opponents worldwide. Instant matchmaking, casual settings."
            icon={<Globe className="w-6 h-6 text-[#F2F0E9]" />}
            color="bg-[#0022FF]"
            badge="HOT"
            onClick={() => navigate("/mode/multiplayer")}
          />
          <ModeCard
            title="1v1 DUEL"
            description="Challenge a friend directly. Password protected rooms with custom AI topics."
            icon={<Swords className="w-6 h-6 text-[#0D0D0D]" />}
            color="bg-white"
            onClick={() => navigate("/mode/1v1")}
          />
          <ModeCard
            title="LOCAL PARTY"
            description="Classic pass-and-play for 2-4 players. Perfect for offline gatherings."
            icon={<Gamepad2 className="w-6 h-6 text-[#0D0D0D]" />}
            color="bg-[#CCFF00]"
            onClick={() => navigate("/mode/local")}
          />
        </div>

        <footer className="mt-12 pt-8 border-t-4 border-[#0D0D0D] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D0D0D] bg-[#CCFF00] flex items-center justify-center text-[10px] font-black">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">
              <span className="text-[#0022FF]">1,240</span> Players Online Now
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/")}
            className="text-xs font-black uppercase tracking-widest hover:text-[#0022FF] transition-colors"
          >
            ← Back to Landing
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
