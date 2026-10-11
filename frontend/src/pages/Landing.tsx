import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useNavigate } from "react-router-dom";
import { Wallet, Briefcase, Search, Shield, Zap, Globe } from "lucide-react";

export default function Landing() {
  const { connectWallet, isConnecting, isConnected } = useWeb3();
  const navigate = useNavigate();

  const features = [
    { icon: Shield, title: "Trustless Escrow", desc: "Smart contracts hold funds securely until work is verified" },
    { icon: Zap, title: "Instant Settlement", desc: "Payments release directly to freelancer wallets — no middlemen" },
    { icon: Globe, title: "Global Access", desc: "No banks, no borders. Work with anyone, pay in ETH" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero */}
      <section className="container pt-24 pb-20 lg:pt-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Built on Ethereum Sepolia Testnet
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Freelance Without
              <span className="text-gradient block">Middlemen</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A decentralized marketplace where smart contracts replace trust.
              Post jobs, hire talent, and pay securely — all on-chain.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <>
                  <Button size="lg" className="gap-2 glow text-base px-8" onClick={() => navigate("/post-job")}>
                    <Briefcase className="h-5 w-5" /> Post a Job
                  </Button>
                  <Button size="lg" variant="secondary" className="gap-2 text-base px-8" onClick={() => navigate("/jobs")}>
                    <Search className="h-5 w-5" /> Browse Jobs
                  </Button>
                </>
              ) : (
                <Button size="lg" className="gap-2 glow animate-pulse-glow text-base px-8" onClick={connectWallet} disabled={isConnecting}>
                  <Wallet className="h-5 w-5" /> Connect Wallet to Start
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="group rounded-xl bg-gradient-card border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:glow"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
