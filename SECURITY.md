# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities directly to **security@slp-zero.network** (or DM @JohnGreetmeCEO).
We appreciate "White Hat" disclosures and will acknowledge receipt within 24 hours.

## Threat Model: The "Proof of Physics"

The State-Locked Protocol (SLP) relies on a **Hardware Root of Trust**.

### In Scope
- **Hardware Spoofing via Software**: An attacker attempting to generate valid SLP proofs using only software (e.g., standard Android emulators). This is the primary vector we mitigate via ARM TrustZone.
- **Replay Attacks**: Using an old, valid hardware proof to trigger a new reward. Mitigated via Monotonic Counters in `lib.rs`.

### Out of Scope (For Hackathon MVP)
- **Nation-State Hardware Lab Attacks**: Physical decapsulation of the chip to extract the Root Key.
- **Ed25519 On-Chain Verification**: Currently, the signature is checked for *presence* and *format* on-chain, but full cryptographic verification is offloaded or checked optimistically due to Compute Budget limits in this specific Hackathon build. **Production will use the `ed25519_program` instruction.**

## Credentials

- **No Private Keys** are stored in this repository.
- The `Anchor.toml` refers to a local wallet path (`~/.config/solana/id.json`) for devnet deployment convenience, but this file is obviously not included.

---

## 🛡️ Production Security Checklist

When moving to native Ed25519 Introspection, we implement the following **"Guardrail Pattern"** to prevent spoofing and signature-reuse attacks:

### ✅ Verified Program ID

| Risk | Guard |
|------|-------|
| Attacker includes a fake "Signature Program" that always returns success | Explicitly verify instruction belongs to `Ed25519SigVerify111111111111111111111111111` |

### ✅ Relative Indexing (The "Relative-One" Rule)

| Risk | Guard |
|------|-------|
| Using absolute index allows attacker to reorder instructions | Use `load_current_index_checked` and look back exactly `-1` from current position |

### ✅ Message Data Integrity

| Risk | Guard |
|------|-------|
| "Phantom Signature" attack: valid signature for a *different* message | Cross-reference `message_data` from precompile with `state_data` in contract |

### ✅ Signer Whitelisting (TEE Binding)

| Risk | Guard |
|------|-------|
| Anyone can create a valid Ed25519 signature | Compare public key with **Hardware Registry** on-chain; only registered TEEs permitted |

### ✅ Signature Uniqueness (Replay Protection)

| Risk | Guard |
|------|-------|
| Attacker replays a valid signature from 10 minutes ago | Every signature includes `Monotonic Counter` or `Recent Blockhash`; track `last_nonce` per TEE |

---

## Audit Status

| Audit | Status |
|-------|--------|
| Internal Review | ✅ Complete |
| External Audit (OtterSec / Neodyme) | 📋 Planned (Post-Hackathon) |
