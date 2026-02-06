"use client"

import * as React from "react"
import { Shield, Lock, Unlock, Cpu, Terminal, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Since Wallet Adapter requires Context Providers which are best placed in layout or a wrapper,
// and we want this scaffold to run standalone easily, I will keep the wallet button as a placeholder 
// or basic implementation if Context works. For this "Judge-Facing Demo", visual simulation is key.
// I will simulate the wallet connection state for the visual narrative.

export default function DashboardPage() {
  const [deviceState, setDeviceState] = React.useState<"LOCKED" | "UNLOCKED">("LOCKED")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [logs, setLogs] = React.useState<string[]>([
    "> System initialized.",
    "> Monitoring for Hardware Interrupts...",
    "> Waiting for foreground pulse..."
  ])
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const handleBroadcastProof = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    addLog("--- INCOMING SIGNAL DETECTED ---")
    addLog("Receiving TEE Signed Payload...")
    
    await new Promise(r => setTimeout(r, 800))
    addLog("Verifying Hardware Monotonic Counter...")
    
    await new Promise(r => setTimeout(r, 800))
    addLog("Analyzing Kinetic Signature (Gyro/Accel)...")
    
    await new Promise(r => setTimeout(r, 800))
    setDeviceState("UNLOCKED")
    addLog("✅ ACCESS GRANTED. Proof verified.")
    addLog("Allocating 512MB Server Memory...")
    setIsProcessing(false)
  }

  const handleSybilAttack = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    addLog("--- INCOMING SIGNAL DETECTED ---")
    addLog("Receiving Payload...")
    
    await new Promise(r => setTimeout(r, 800))
    addLog("Verifying Hardware Monotonic Counter...")
    
    await new Promise(r => setTimeout(r, 600))
    addLog("❌ ERROR 6001: InvalidHardwareSignature")
    addLog("⚠️  Transaction Rejected. Zero-Allocation enforced.")
    setDeviceState("LOCKED")
    setIsProcessing(false)
  }

  const handleReset = () => {
    setDeviceState("LOCKED")
    setLogs(["> System reset.", "> Monitoring for Hardware Interrupts..."])
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              State-Locked Protocol
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Mission Control: Live Ghost Fleet Defense
            </p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={handleReset}>Reset System</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Status Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Device State</CardTitle>
                <CardDescription>Real-time Hardware Lock Status</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className={cn(
                  "relative flex items-center justify-center w-32 h-32 rounded-full border-4 transition-all duration-500",
                  deviceState === "LOCKED" 
                    ? "border-destructive/50 bg-destructive/10 shadow-[0_0_30px_-5px_var(--color-destructive)]" 
                    : "border-green-500/50 bg-green-500/10 shadow-[0_0_30px_-5px_#22c55e]"
                )}>
                  {deviceState === "LOCKED" ? (
                    <Lock className="h-12 w-12 text-destructive animate-pulse" />
                  ) : (
                    <Unlock className="h-12 w-12 text-green-500" />
                  )}
                </div>
                <div className="text-center">
                  <h2 className={cn(
                    "text-3xl font-bold tracking-widest",
                    deviceState === "LOCKED" ? "text-destructive" : "text-green-500"
                  )}>
                    {deviceState}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {deviceState === "LOCKED" ? "Zero-Power Mode Active" : "Resources Allocated"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Simulation Controls</CardTitle>
                <CardDescription>Trigger physical events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full text-lg h-14 bg-green-600 hover:bg-green-700 text-white" 
                  onClick={handleBroadcastProof}
                  disabled={isProcessing || deviceState === "UNLOCKED"}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Broadcast Valid TEE Proof
                </Button>
                
                <Button 
                  className="w-full text-lg h-14" 
                  variant="destructive"
                  onClick={handleSybilAttack}
                  disabled={isProcessing}
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Attempt Sybil Attack
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Console Column */}
          <div className="lg:col-span-2">
            <Card className="h-full border-border bg-black/80 font-mono text-sm shadow-2xl overflow-hidden flex flex-col">
              <CardHeader className="bg-zinc-900/50 border-b border-zinc-800 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Terminal className="h-4 w-4" />
                  <span>Validator Node Output</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 relative">
                <div 
                  ref={scrollRef}
                  className="h-[500px] overflow-y-auto p-4 space-y-2 text-green-400/90"
                >
                  {logs.map((log, i) => (
                    <div key={i} className="break-all border-l-2 border-transparent hover:border-zinc-700 pl-2">
                       {log}
                    </div>
                  ))}
                  {isProcessing && (
                     <div className="animate-pulse">_</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
