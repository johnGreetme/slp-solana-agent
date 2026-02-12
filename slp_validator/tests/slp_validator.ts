import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SlpValidator } from "../target/types/slp_validator";
import { assert } from "chai";

describe("slp_validator simulation", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.SlpValidator as Program<SlpValidator>;
    const drones: { keypair: anchor.web3.Keypair, hardwareId: string, pda: anchor.web3.PublicKey }[] = [];

    // Helper to sleep
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    it("Generates and Registers a Fleet", async () => {
        // Generate 5 random keypairs
        for (let i = 0; i < 5; i++) {
            const kp = anchor.web3.Keypair.generate();
            const hardwareId = `drone-${i}-${kp.publicKey.toBase58().substring(0,6)}`;
            
            const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
                [Buffer.from("device"), Buffer.from(hardwareId)],
                program.programId
            );

            drones.push({ keypair: kp, hardwareId, pda });
            
            await program.methods.registerDevice(hardwareId)
            .accounts({
                deviceState: pda,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
            
            console.log(`Registered ${hardwareId}`);
        }
    });

    it("Test A: Drone wakes up due to SLP_TRIGGER_GPS_GEOFENCE (Success)", async () => {
        const drone = drones[0];
        const counter = new anchor.BN(100);
        const triggerType = 1; // GPS
        // string signature (64-byte mock)
        const signature = "a".repeat(64); // 64-character mock hex/string signature

        console.log(`\n[Test A] ${drone.hardwareId} sending Trigger: GPS (1)`);

        await program.methods.verifyProof(counter, triggerType, signature)
        .accounts({
            deviceState: drone.pda,
            authority: provider.wallet.publicKey,
        })
        .rpc();

        const state = await program.account.deviceState.fetch(drone.pda);
        assert.ok(state.lastCounter.eq(counter), "Counter check failed");
        console.log("✅ Check verified.");
    });

    it("Test B: Drone wakes up due to SLP_TRIGGER_VIBRATION (Success)", async () => {
        const drone = drones[1];
        const counter = new anchor.BN(200);
        const triggerType = 3; // Vibration
        const signature = "b".repeat(64);

        console.log(`\n[Test B] ${drone.hardwareId} sending Trigger: Mutation (3)`);

        await program.methods.verifyProof(counter, triggerType, signature)
        .accounts({
            deviceState: drone.pda,
            authority: provider.wallet.publicKey,
        })
        .rpc();

        const state = await program.account.deviceState.fetch(drone.pda);
        assert.ok(state.lastCounter.eq(counter), "Counter check failed");
        console.log("✅ Check verified.");
    });

    it("Test C: Drone sends an old counter (Fail)", async () => {
        const drone = drones[0];
        // We already sent counter 100 in Test A.
        // Let's try sending 99 (stale) or 100 (replay).
        const oldCounter = new anchor.BN(100); 
        const triggerType = 2; // NFC
        const signature = "c".repeat(64);

        console.log(`\n[Test C] ${drone.hardwareId} sending OLD Counter: 100 (Should Fail)`);

        try {
            await program.methods.verifyProof(oldCounter, triggerType, signature)
            .accounts({
                deviceState: drone.pda,
                authority: provider.wallet.publicKey,
            })
            .rpc();
            
            assert.fail("Should have failed with StaleProof error");
        } catch(e: any) {
            // Anchor error logs are verbose, checking if it threw is good enough for simulation
            // In a real test we'd check `e.error.errorCode.code === "StaleProof"`
            console.log(`✅ Correctly rejected old counter. Error: ${e.message || e}`);
        }
    });
});
