import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return <Navigate to="/mode" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginMutation.mutateAsync({ username, password });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerMutation.mutateAsync({ username, password });
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] flex items-center justify-center p-4 font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-4 border-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] rounded-none">
          <CardHeader className="bg-[#0022FF] border-b-4 border-[#0D0D0D] text-[#F2F0E9] rounded-none">
            <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">
              MangQuiz Access
            </CardTitle>
            <CardDescription className="text-[#F2F0E9]/80 font-bold uppercase text-xs">
              Authenticate to join the league
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#0D0D0D] rounded-none p-1">
                <TabsTrigger 
                  value="login" 
                  className="rounded-none data-[state=active]:bg-[#CCFF00] data-[state=active]:text-[#0D0D0D] font-black uppercase text-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-none data-[state=active]:bg-[#CCFF00] data-[state=active]:text-[#0D0D0D] font-black uppercase text-sm"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-black uppercase text-xs tracking-widest">Username</Label>
                    <Input 
                      id="username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-2 border-[#0D0D0D] rounded-none focus-visible:ring-0 focus-visible:border-[#0022FF] focus-visible:border-4"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-black uppercase text-xs tracking-widest">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-2 border-[#0D0D0D] rounded-none focus-visible:ring-0 focus-visible:border-[#0022FF] focus-visible:border-4"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loginMutation.isPending}
                    className="w-full bg-[#CCFF00] text-[#0D0D0D] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase rounded-none mt-4"
                  >
                    {loginMutation.isPending ? "Authenticating..." : "Enter League"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username" className="font-black uppercase text-xs tracking-widest">Pick Username</Label>
                    <Input 
                      id="reg-username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-2 border-[#0D0D0D] rounded-none focus-visible:ring-0 focus-visible:border-[#CCFF00] focus-visible:border-4"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="font-black uppercase text-xs tracking-widest">Create Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-2 border-[#0D0D0D] rounded-none focus-visible:ring-0 focus-visible:border-[#CCFF00] focus-visible:border-4"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={registerMutation.isPending}
                    className="w-full bg-[#FF4D4D] text-[#0D0D0D] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase rounded-none mt-4"
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Join the Fight"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
