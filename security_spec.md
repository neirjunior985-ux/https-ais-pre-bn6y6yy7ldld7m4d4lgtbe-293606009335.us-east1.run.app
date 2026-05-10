# Security Specification for Orçamento Pro Explorer

## Data Invariants
- A client must belong to an authenticated user (`ownerId`).
- An estimate must belong to an authenticated user (`ownerId`).
- A service must belong to an authenticated user (`ownerId`).
- A business profile is unique to a user (`uid` as document ID).
- Timestamps (`createdAt`, `updatedAt`) must be server-validated.
- Status values must be from the allowed set: pending, approved, rejected, expired.

## The Dirty Dozen Payloads (Target: DENIED)

1. **Identity Spoofing**: Creating a client with another user's UID as `ownerId`.
2. **Shadow Field**: Adding `isVerified: true` to a Client document.
3. **Price Manipulation**: Updating an estimate total to 0 without changing items.
4. **Ownership Bypass**: Reading another user's clients.
5. **ID Poisoning**: Injecting a 1MB string as a document ID for an estimate.
6. **Time Spoofing**: Setting `createdAt` to a future date manually.
7. **Role Escalation**: Attempting to write to a non-existent `admins` collection.
8. **State Skip**: Changing an estimate status from `expired` back to `pending`.
9. **Orphaned Estimate**: Creating an estimate for a `clientId` that doesn't exist.
10. **Malicious Service**: Creating a service with a negative `unitPrice`.
11. **Email Spoofing**: Accessing PII using an unverified email.
12. **Blanket Query**: List all estimates without a `where('ownerId', '==', uid)` clause.
