# Donation System (Gateway-Free Demo)

## Overview
The donation system no longer integrates with Stripe. Donations are simulated: when a user submits the donation form, the backend immediately records a completed donation and increments the campaign's totals. No real payments are processed.

## Setup Requirements
1. Ensure JWT authentication is configured (users must be logged in to donate).
2. No payment gateway environment variables are needed.

## Donating Flow
1. User selects or enters an amount, adds an optional message, and may choose to donate anonymously.
2. Mock card fields are provided only for UI/UX; they are not sent to any gateway.
3. Frontend calls POST `/api/donations` with the donation details.
4. Backend creates a Donation with `paymentStatus = "completed"`, and updates the Campaign's `raisedAmount` and `donorsCount`.

## Development Notes
- Backend routes are secured with authentication middleware.
- Amounts are handled in whole currency units (e.g., USD dollars).
- No webhook handling is required.

## Error Handling
- Any server error when saving the donation returns a 500 with a message.
- The UI shows clear error messages and never spins indefinitely.

## Security Notes
- Do not collect or store real card details in this demo flow.
- Remove any leftover payment keys from `.env` files to avoid confusion.