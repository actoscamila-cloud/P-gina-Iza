# Security Specification - Roones Admin

## 1. Data Invariants
- Each user profile must belong to a specific UID (id).
- Tracks must have valid ID, title, and modules array.
- Chat sessions must be linked to a userId.
- Config documents must follow the app settings schema.

## 2. Access Control Model
- **Public access (Temporary/Anonymous):** Currently, the app expects to work without complex auth for initial synchronization.
- **Goal:** All writes should eventually be authenticated.

## 3. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing:** Create a user with a different UID than current auth.
2. **Resource Poisoning:** Track with 1MB title.
3. **ID Poisoning:** Document ID with special characters or excessive size (>128 chars).
4. **State Shortcutting:** Manually setting points or prestige to impossible values.
5. **Orphaned Writes:** Chat session without a valid userId.
6. **Config Hijacking:** Modifying aiPrompt with malicious script.
7. **Bulk Delete:** Attempting to delete all tracks via collection query.
8. **Shadow Fields:** Adding 'isVerified: true' to a user profile.
9. **Timestamp Spoofing:** Setting createdAt to a future date.
10. **Role Escalation:** Changing own role to 'SUPER_ADMIN'.
11. **PII Leak:** Reading all user emails without being owner.
12. **Recursive Cost Attack:** Querying with nested filters designed to maximize read costs.

## 4. Proposed Rules Architecture
- Use `isValidId()` for all document ID variables.
- Use `isValidUser()`, `isValidTrack()`, etc., for schema validation.
- Implement `isAdmin()` based on email or trusted document lookup.
- Protect terminal states (e.g., certificates).
