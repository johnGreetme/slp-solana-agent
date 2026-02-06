use anchor_lang::prelude::*;

declare_id!("97aMxMjX3ANbg8mm1gVJCppUqZmo5oCmHuggASZ7Yup1");

#[program]
pub mod slp_validator {
    use super::*;

    pub fn register_device(ctx: Context<RegisterDevice>, hardware_id: String) -> Result<()> {
        // Input validation: prevent excessively long hardware IDs
        require!(
            !hardware_id.is_empty() && hardware_id.len() <= 64,
            ErrorCode::InvalidHardwareId
        );
        
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
        _signature: String
    ) -> Result<()> {
        // ⚠️ SECURITY WARNING: Signature verification is NOT implemented in this demo.
        // In production, you MUST verify the TEE signature here to ensure the proof
        // is authentic and signed by the hardware enclave.
        // See SECURITY.md for implementation recommendations.
        
        let device_state = &mut ctx.accounts.device_state;

        // Logic 1: Check if counter is fresh
        // Strict greater than check for replay protection
        require!(
            monotonic_counter > device_state.last_counter,
            ErrorCode::StaleProof
        );

        // Logic 2: Update state
        device_state.last_counter = monotonic_counter;
        if device_state.reputation_score < 100 {
            device_state.reputation_score += 1;
        }

        // Logic 3: Validate & Map Trigger Type
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

        // Logic 4: Emit Event
        emit!(ProofVerified {
            device: device_state.key(),
            counter: monotonic_counter,
            trigger_type: trigger_enum,
            reputation: device_state.reputation_score,
        });

        msg!("Proof Verified! Counter: {}, Trigger: {:?}", monotonic_counter, trigger_enum);
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
    pub authority: Pubkey,       // 32
    pub last_counter: u64,       // 8
    pub reputation_score: u8,    // 1
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
    #[msg("Hardware ID must be between 1 and 64 characters.")]
    InvalidHardwareId,
}
