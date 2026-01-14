import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  Globe,
  History,
  Trophy,
  Users,
  Swords,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioControl } from "@/components/ui/audio-control";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-500/30 relative overflow-hidden">
      {/* Dither Noise Overlay */}
      <div className="fixed inset-0 dither-noise z-50 pointer-events-none mix-blend-overlay opacity-20" />

      {/* Background Grid */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-40 border-b border-white/5 bg-navy-950/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-400 rounded-lg flex items-center justify-center font-bold text-navy-950 text-xl shadow-lg">
                M
              </div>
              <span className="font-bold text-xl tracking-tight text-white">MangQuiz</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <a 
                href="#features" 
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                Features
              </a>
              <button 
                onClick={() => navigate('/mode')} 
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                Modes
              </button>
              
              {/* Audio Control */}
              <div className="ml-2">
                <AudioControl 
                  variant="navbar" 
                  responsive={true}
                  className="relative"
                />
              </div>
              
              {/* CTA Button */}
              <div className="ml-4 pl-4 border-l border-white/10">
                <button
                  onClick={onStart}
                  className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-gold-500/20"
                >
                  Play Now
                </button>
              </div>
            </div>

            {/* Mobile Menu Button & Audio */}
            <div className="md:hidden flex items-center gap-2">
              <AudioControl 
                variant="navbar" 
                responsive={true}
                className="relative"
              />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-navy-950/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-6 py-4 space-y-2">
              <a 
                href="#features" 
                className="block px-4 py-3 text-slate-400 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <button 
                onClick={() => {
                  navigate('/mode');
                  setIsMobileMenuOpen(false);
                }} 
                className="block w-full text-left px-4 py-3 text-slate-400 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
              >
                Modes
              </button>
              
              {/* Mobile CTA */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    onStart();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold rounded-lg transition-all duration-200 shadow-lg"
                >
                  Play Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 border-b border-white/5">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold-500/30 bg-gold-500/5 text-gold-400 text-xs font-mono uppercase tracking-widest">
              <span className="w-2 h-2 bg-gold-500 animate-pulse" />
              Live Multiplayer Trivia
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              Battle friends in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-orange-500">
                fast-paced
              </span> <br />
              history trivia.
            </h1>

            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Join rooms, pick your era, and race against the clock. The ultimate test of knowledge and speed awaits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={onStart}
                variant="premium"
                size="xl"
                className="shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Start Battling
              </Button>
            </div>

            <div className="pt-8 flex items-center gap-4 text-sm text-slate-500 font-mono">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-slate-800 border border-navy-950 rounded-full flex items-center justify-center text-xs text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p>Join 1,000+ historians today</p>
            </div>

            <div className="pt-4 text-xs font-mono text-slate-600 uppercase tracking-widest">
              Rafi Ikhsanul Hakim IBM Capstone Project
            </div>
          </div>

          {/* Right: Animated Dither Scene */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/20 to-blue-500/20 blur-3xl opacity-30" />
            <div className="relative border border-white/10 bg-navy-900/80 backdrop-blur-sm p-6 shadow-2xl">
              {/* Mock Game UI */}
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500/50" />
                  <div className="w-3 h-3 bg-yellow-500/50" />
                  <div className="w-3 h-3 bg-green-500/50" />
                </div>
                <div className="font-mono text-xs text-gold-400">ROOM: #8291</div>
              </div>

              <div className="space-y-6">
                {/* Question */}
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono text-blue-400">QUESTION 4/10</span>
                  <h3 className="text-xl font-bold leading-tight">
                    Which empire was known as the "Empire on which the sun never sets"?
                  </h3>
                </div>

                {/* Timer Bar */}
                <div className="h-2 bg-white/10 w-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="h-full bg-gold-500"
                  />
                </div>

                {/* Answers */}
                <div className="grid grid-cols-2 gap-3">
                  {["Roman Empire", "British Empire", "Mongol Empire", "Ottoman Empire"].map((ans, i) => (
                    <div key={i} className={`p-3 border ${i === 1 ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-white/10 hover:border-white/30"} transition-colors cursor-pointer`}>
                      <span className="text-xs font-mono opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>
                      {ans}
                    </div>
                  ))}
                </div>

                {/* Players */}
                <div className="flex justify-between items-end pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 flex items-center justify-center font-bold text-white">P1</div>
                    <div>
                      <div className="text-xs text-slate-400">YOU</div>
                      <div className="font-mono font-bold">1,240 pts</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 animate-pulse">
                    +150 PTS
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-xs text-slate-400">OPPONENT</div>
                      <div className="font-mono font-bold">980 pts</div>
                    </div>
                    <div className="w-10 h-10 bg-red-500 flex items-center justify-center font-bold text-white">P2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-b border-white/5 bg-navy-900/30">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <History className="w-8 h-8" />, title: "Pick Your Era", desc: "From Ancient Rome to Pop Culture, choose your battlefield." },
              { icon: <Users className="w-8 h-8" />, title: "Join a Room", desc: "Create a private lobby or jump into a public match instantly." },
              { icon: <Trophy className="w-8 h-8" />, title: "Challenge & Win", desc: "Battle friends in 1v1 matches and prove your knowledge supremacy." }
            ].map((step, i) => (
              <div key={i} className="group p-6 border border-transparent hover:border-white/10 transition-colors">
                <div className="w-16 h-16 mx-auto bg-white/5 flex items-center justify-center mb-6 text-gold-400 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <br /><span className="text-gold-400">rewrite history</span>.</h2>
          </div>

          <div className="grid md:grid-cols-4 md:grid-rows-2 gap-4 h-[800px] md:h-[600px]">
            {/* Large Card: Game Modes */}
            <div className="md:col-span-2 md:row-span-2 sharp-card p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Swords className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gold-500 text-navy-950 flex items-center justify-center mb-6">
                  <Swords className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Multiple Game Modes</h3>
                <ul className="space-y-4 text-slate-300">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-gold-400" />
                    <strong className="text-white">Local Mode:</strong> Play with friends.
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-gold-400" />
                    <strong className="text-white">Party Mode:</strong> Up to 8 players chaos.
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-gold-400" />
                    <strong className="text-white">Ranked:</strong> Competitive seasonal play.
                  </li>
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <div className="space-y-4">
                  <div className="h-32 bg-navy-900 border border-white/10 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gold-400">RANKED MATCH</span>
                      <span className="text-xs font-mono text-red-400">LIVE</span>
                    </div>
                    <div className="flex items-end justify-between h-16 gap-2">
                      <div className="w-full bg-blue-500/20 h-[40%] relative group-hover:h-[60%] transition-all duration-500">
                        <div className="absolute bottom-0 w-full bg-blue-500 h-1" />
                      </div>
                      <div className="w-full bg-red-500/20 h-[70%] relative group-hover:h-[50%] transition-all duration-500">
                        <div className="absolute bottom-0 w-full bg-red-500 h-1" />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/mode')}
                    variant="gold"
                    className="w-full shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                  >
                    Choose Mode
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Medium Card: Eras */}
            <div className="md:col-span-2 sharp-card p-8 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-white">
                    <History className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">6+ CATEGORIES</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Diverse Eras</h3>
                <p className="text-slate-400 text-sm">Master every period of human history.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-6">
                {["Ancient", "Medieval", "Modern", "Wars", "Pop", "Science"].map((era) => (
                  <div key={era} className="text-center p-2 border border-white/5 bg-navy-900/50 text-xs font-mono hover:border-gold-500/50 hover:text-gold-400 cursor-default transition-colors">
                    {era}
                  </div>
                ))}
              </div>
            </div>

            {/* Small Card: 1v1 Battle */}
            <div className="sharp-card p-6 flex flex-col justify-between group">
              <Swords className="w-8 h-8 text-red-400 mb-4" />
              <div>
                <h3 className="text-lg font-bold mb-1">1v1 Battle</h3>
                <p className="text-xs text-slate-400">Challenge friends directly.</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Quick Match</span>
                  <span className="font-mono text-gold-400">2 MIN</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Best of</span>
                  <span className="font-mono text-gold-400">10 Q</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/mode/1v1')}
                size="sm"
                variant="gold-outline"
                className="mt-4 w-full text-xs py-2"
              >
                Challenge Now
              </Button>
            </div>

            {/* Small Card: Custom Rooms */}
            <div className="sharp-card p-6 flex flex-col justify-between group">
              <Globe className="w-8 h-8 text-blue-400 mb-4" />
              <div>
                <h3 className="text-lg font-bold mb-1">Custom Rooms</h3>
                <p className="text-xs text-slate-400">Host private games.</p>
              </div>
              <div className="mt-4">
                <div className="w-full h-12 border border-dashed border-white/20 flex items-center justify-center text-xs font-mono text-slate-500">
                  INVITE CODE: X9J2
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1v1 Battle Section */}
      <section id="1v1-battle" className="py-32 px-6 bg-navy-900/20 border-t border-white/5 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-mono uppercase tracking-widest">
                <span className="w-2 h-2 bg-red-500 animate-pulse" />
                New Feature
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Challenge Friends in <br />
                <span className="gradient-text">1v1 Battle</span>
              </h2>

              <p className="text-xl text-slate-400 leading-relaxed">
                Face off against your friends in intense head-to-head trivia battles. Quick matches, instant results, and bragging rights on the line.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gold-500 rounded-full" />
                    <span className="text-sm font-medium text-white">Quick Setup</span>
                  </div>
                  <p className="text-sm text-slate-400 pl-4">Start a match in seconds</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gold-500 rounded-full" />
                    <span className="text-sm font-medium text-white">Real-time</span>
                  </div>
                  <p className="text-sm text-slate-400 pl-4">Live scoring and updates</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gold-500 rounded-full" />
                    <span className="text-sm font-medium text-white">Best of 10</span>
                  </div>
                  <p className="text-sm text-slate-400 pl-4">Perfect match length</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gold-500 rounded-full" />
                    <span className="text-sm font-medium text-white">Instant Results</span>
                  </div>
                  <p className="text-sm text-slate-400 pl-4">See who wins immediately</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => navigate('/mode/1v1')}
                  variant="gold"
                  size="lg"
                  className="shadow-lg hover:shadow-gold-500/20"
                >
                  <Swords className="w-5 h-5 mr-2" />
                  Start 1v1 Battle
                </Button>
                <Button
                  onClick={() => navigate('/mode')}
                  variant="navy"
                  size="lg"
                >
                  View All Modes
                </Button>
              </div>
            </div>

            {/* Right: VS Battle Preview */}
            <div className="relative">
              {/* Background Effects */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px]" />
              </div>

              {/* VS Battle Container */}
              <div className="relative bg-navy-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Diagonal Background Slashes */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-0 w-[60%] h-full bg-gradient-to-r from-red-900/20 to-transparent transform -skew-x-12 origin-top-left" />
                  <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-blue-900/20 to-transparent transform skew-x-12 origin-top-right" />
                </div>

                {/* Player 1 - Left Side */}
                <div className="absolute left-8 flex flex-col items-center">
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 w-20 h-20 bg-red-500/30 rounded-full blur-xl animate-pulse" />
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-3 border-red-400 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-red-500/30 relative z-10">
                      Y
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-white tracking-tight">
                    You
                  </h3>
                  <div className="mt-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Host
                    </span>
                  </div>
                </div>

                {/* VS Text - Center */}
                <div className="relative z-20">
                  {/* VS Glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
                  </div>
                  {/* VS Text Shadow */}
                  <span className="absolute text-5xl font-black text-slate-800 select-none blur-sm">
                    VS
                  </span>
                  {/* VS Text */}
                  <span className="relative text-5xl font-black bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent select-none drop-shadow-xl">
                    VS
                  </span>
                  {/* Diagonal Slash through VS */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rotate-[-20deg] origin-center" />
                </div>

                {/* Player 2 - Right Side */}
                <div className="absolute right-8 flex flex-col items-center">
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 w-20 h-20 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-3 border-blue-400 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-500/30 relative z-10">
                      F
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-white tracking-tight">
                    Friend
                  </h3>
                  <div className="mt-2 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Challenger
                    </span>
                  </div>
                </div>

                {/* Battle Status - Bottom */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                    Ready to Battle
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-400 font-medium">Quick Match</span>
                    </div>
                    <div className="w-1 h-4 bg-white/20" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gold-400 font-medium">10 Questions</span>
                    </div>
                  </div>
                </div>

                {/* Subtle Spark Effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: "50%",
                        y: "50%",
                        scale: 0,
                        opacity: 1,
                      }}
                      animate={{
                        x: `${20 + Math.random() * 60}%`,
                        y: `${20 + Math.random() * 60}%`,
                        scale: [0, 1, 0],
                        opacity: [1, 0.8, 0],
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.5,
                        repeat: Infinity,
                        repeatDelay: 4,
                      }}
                      className="absolute w-1 h-1 bg-amber-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/5 bg-navy-900/30 text-center px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Ready to make history?
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            Join thousands of players in the ultimate test of historical knowledge.
          </p>
          <Button
            onClick={onStart}
            variant="premium"
            size="xl"
            className="shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            Play Now <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-navy-950 text-center">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gold-500 flex items-center justify-center font-bold text-navy-950 text-xs">M</div>
            <span className="font-bold tracking-tight">MangQuiz</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 MangQuiz. All rights reserved.
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
