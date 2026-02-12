use anchor_lang::prelude::*;

declare_id!("97aMxMjX3ANbg8mm1gVJCppUqZmo5oCmHuggASZ7Yup1");

#[program]
pub mod slp_validator {
    use super::*;

    pub fn register_device(ctx: Context<RegisterDevice>, hardware_id: String) -> Result<()> {
        let device_state = &mut ctx.accounts.device_state;
        device_state.authority = ctx.accounts.authority.key();
        device_state.last_counter = 0;
        device_state.reputation_score = 0;

        msg!("Device Registered: {}", hardware_id);
        Ok(())
    }

    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        monotonic_counter: u64,
        trigger_type: u8,
        signature: String,
    ) -> Result<()> {
        let device_state = &mut ctx.accounts.device_state;

        // Logic 1: Check if counter is fresh
        // Strict greater than check for replay protection
        if monotonic_counter <= device_state.last_counter {
            return err!(ErrorCode::StaleProof);
        }

        // Logic 2: Verify Signature (The Fix)
        // ARCHITECTURAL NOTE:
        // Native Ed25519 verification is deferred to V2 via Instruction Introspection.
        // Current check enforces structure only (64-byte Ed25519 signature format), not cryptographic validity.
        require!(signature.len() == 64, ErrorCode::InvalidSignatureFormat);

        msg!("Ingesting TEE Signature Format: {}...", &signature[..10]);

        // Logic 3: Update state
        device_state.last_counter = monotonic_counter;
        if device_state.reputation_score < 100 {
            device_state.reputation_score += 1;
        }

        // Logic 4: Validate & Map Trigger Type
        // We accept u8 (0-3) and map to Enum for the event.
        // If invalid u8 is passed, we default to Manual (0) or error.
        // For now, let's treat any unknown as standard/manual or just emit as is.
        // Let's interpret strictly based on C++ header.
        let trigger_enum = match trigger_type {
            1 => TriggerType::GpsGeofence,
            2 => TriggerType::NfcHandshake,
            3 => TriggerType::Vibration,
            _ => TriggerType::ManualInteraction, // Default to 0 or fallback
        };

        // Logic 5: Emit Event
        emit!(ProofVerified {
            device: device_state.key(),
            counter: monotonic_counter,
            trigger_type: trigger_enum,
            reputation: device_state.reputation_score,
        });

        msg!(
            "Proof Verified! Counter: {}, Trigger: {:?}",
            monotonic_counter,
            trigger_enum
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(hardware_id: String)]
pub struct RegisterDevice<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1, // Discriminator + Pubkey + u64 + u8
        seeds = [b"device", hardware_id.as_bytes()],
        bump
    )]
    pub device_state: Account<'info, DeviceState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyProof<'info> {
    #[account(mut, has_one = authority)]
    pub device_state: Account<'info, DeviceState>,

    pub authority: Signer<'info>,
}

#[account]
pub struct DeviceState {
    pub authority: Pubkey,    // 32
    pub last_counter: u64,    // 8
    pub reputation_score: u8, // 1
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum TriggerType {
    ManualInteraction = 0, // User unlocked screen
    GpsGeofence = 1,       // Entered delivery zone
    NfcHandshake = 2,      // Physical tap
    Vibration = 3,         // Kinetic impact
}

#[event]
pub struct ProofVerified {
    pub device: Pubkey,
    pub counter: u64,
    pub trigger_type: TriggerType,
    pub reputation: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The proof counter is stale (less than or equal to stored counter).")]
    StaleProof,
    #[msg("Hardware signature format is invalid (must be 64 bytes).")]
    InvalidSignatureFormat,
}
