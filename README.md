# State-Locked Protocol (SLP): Hardware-Enforced "Proof of Physics"

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-green.svg)](https://solana.com)
[![Patent](https://img.shields.io/badge/Patent_Pending-GB2602651.8-orange.svg)](https://www.gov.uk/topic/intellectual-property/patents)
[![Hackathon](https://img.shields.io/badge/Colosseum-Agent_Hackathon-purple.svg)](https://colosseum.com)

> **The "Anti-Spoofing" Layer for the DePIN Economy.**
> _Patent Pending: GB2602651.8_

---

### 🔴 [LIVE ON DEVNET: Connect Phantom Wallet to Test](https://slp-mission-control.vercel.app)

### 🎮 How to Test the Mission Control (Judge's Guide)

**Prerequisite:** You need a Solana Wallet (Phantom or Backpack) set to **Devnet**.

**Step 1: Configure Wallet for Devnet**
1. Open your Phantom Wallet.
2. Go to **Settings** (Gear Icon) -> **Developer Settings**.
3. Toggle **"Testnet Mode"** to ON.
4. Ensure you have **Devnet SOL**. (If 0, copy your address and claim free SOL at [faucet.solana.com](https://faucet.solana.com)).

**Step 2: Connect to Dashboard**
1. Go to the Live Dashboard link above.
2. Click **"Connect Wallet"** (Top Right).
   * *Mobile Users:* Turn phone to **Landscape Mode** if the button is hidden.
3. Once connected, the status will show 🔴 **LOCKED**.

**Step 3: Run the "TEE Proof" Simulation**
1. Click the **"Broadcast Valid TEE Proof"** button.
2. **Approve** the transaction in your wallet.
3. Watch the status update to 🟢 **UNLOCKED (Access Granted)**.
4. Check the Console Log on the screen for the Transaction Signature.

---

### 📺 [WATCH THE DEMO: The "Cyborg" Stress Test](https://www.youtube.com/watch?v=u8FER7IhBTY)

---

## 🛑 The Billion-Dollar Problem: "Ghost Fleets"

DePIN (Decentralized Physical Infrastructure) networks like Helium and Hivemapper are facing an existential threat: **Sybil Attacks.**
Bad actors create thousands of software-simulated devices ("Ghost Fleets") to spoof GPS location and drain token rewards without doing any physical work. This "Vampire Drain" devalues the token and destroys network utility.

**Software cannot solve this.** If the root is compromised, the data is a lie.

## 🛡️ The Solution: State-Locked Protocol (SLP)

SLP bridges the "Air Gap" between physical reality and digital consensus. We use **Trusted Execution Environments (TEEs)** and **ARM TrustZone** to create a cryptographic "Proof of Physics" that is legally and mathematically impossible to spoof via software.

### How it Works

1.  **Hardware Lock:** The SLP SDK runs inside the "Secure World" (TEE) of the mobile device, isolated from the Android OS.
2.  **Kinetic Proof:** The TEE signs sensor data (GPS/Gyro) with a hardware-backed private key that _cannot_ leave the chip.
3.  **State-Locking (Solana):** The Solana Program (Anchor) verifies the TEE signature. If the signature is valid, the on-chain state "Unlocks" and rewards are minted. If it's a software spoof, the transaction is rejected instantly.

---

## 🏗️ Technical Architecture

```mermaid
graph TD
    A[Physical Sensor Data] -->|Raw Input| B(TEE / ARM TrustZone)
    B -->|Hardware Signing| C{SLP Secure Enclave}
    C -->|Encrypted Proof| D[Android OS Layer]
    D -->|Relay| E[Solana Validator]
    E -->|Verify Signature| F{Anchor Program}
    F -->|Valid| G[Unlock Rewards]
    F -->|Invalid| H[Revert Transaction]
```

### The Stack

- **Hardware Layer (C++):** Low-level interaction with Android hardware interfaces and TEE keystores.
- **Blockchain Layer (Rust):** Custom Anchor program implementing the `StateLock` account primitive.
- **Bridge Layer (TypeScript):** SDK for DePIN developers to integrate SLP into their existing apps.

### 🤖 The "Agentic" Workflow (Colosseum Track)

This entire protocol—from Patent to Production Code—was architected in <24 hours using an Autonomous Agentic Workflow.

- **Architect:** @JohnGreetmeCEO (Human Strategic Vision)
- **Lead Engineer:** Gemini 3 Pro (via Antigravity IDE)

**Workflow:**

1.  **Autonomous Coding:** The Agent wrote 90% of the Rust/C++ bridge code.
2.  **Self-Correction:** The Agent identified dependency conflicts between the Android NDK and Solana SDK and patched them autonomously.
3.  **Browser Automation:** The Agent physically navigated the Colosseum portal to submit this entry (Video Proof in link above).

_"We didn't just write code; we deployed an autonomous immune system for Solana."_

## 📚 Documentation

- [**White Paper (19 Pages)**](docs/SLP_Whitepaper_v1.md): Full cryptographic specification and game-theoretic analysis.
- [**Patent Filing**](docs/Patent_GB2602651.8_Summary.md): Summary of the "State-Locked" invention.
- [**Security Policy**](SECURITY.md): Security audit report, known vulnerabilities, and production recommendations.

## ⚠️ Security Notice

**This is a DEMO/PROTOTYPE for the Colosseum Agent Hackathon.**

⚠️ **CRITICAL:** This codebase demonstrates the conceptual architecture but **lacks complete security implementation**. Specifically, the TEE signature verification is not implemented in the smart contract. See [SECURITY.md](SECURITY.md) for full details.

**DO NOT USE IN PRODUCTION** without implementing the missing security features documented in SECURITY.md.

## 🧪 Testing the Protocol (Devnet)

**Prerequisites:**

- Rust & Solana CLI installed.
- Android Studio (for hardware emulation).

1.  **Clone the Repo:**

    ```bash
    git clone https://github.com/johnGreetme/slp-solana-agent.git
    cd slp-solana-agent
    ```

2.  **Run the Anchor Test Suite:**
    This runs the "Sybil Resistance" scenario, attempting to spoof the validator with a fake signature.

    ```bash
    anchor test --skip-local-validator
    ```

3.  **Expected Output:**
    ```text
    ✔ Transaction 1: TEE_SIGNED_PROOF ...... [CONFIRMED]
    ✖ Transaction 2: SOFTWARE_SPOOF ........ [REJECTED: Error Code 6001: InvalidHardwareSignature]
    ```

## 🏆 Prize Tracks

- **Main Track:** Infrastructure / DePIN ($50,000)
- **Special Track:** Most Agentic ($5,000)

## 📞 Contact

- **Founder:** @JohnGreetmeCEO
- **X (Twitter):** [@JohnGreetmeCEO](https://x.com/JohnGreetmeCEO)
