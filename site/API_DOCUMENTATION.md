# Casper Prize Vault API Documentation

## Overview

The Casper Prize Vault is a no-loss DeFi savings protocol on the Casper Network. This API provides endpoints for users to track their deposits, rewards, and win history, as well as admin endpoints for managing the vault and conducting prize draws.

**Base URL**: `http://localhost:3000/api/v1`

**Version**: 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [User Endpoints](#user-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)

---

## Authentication

### User Endpoints
User endpoints do not require authentication. Users are identified solely by their Casper public key.

### Admin Endpoints
Admin endpoints require an admin secret header:

```
X-Admin-Secret: your-admin-secret-here
```

**Security Note**: Keep your admin secret secure. Consider implementing IP whitelisting for production environments.

---

## Rate Limiting

### Standard Rate Limits (User Endpoints)
- **Window**: 15 minutes
- **Max Requests**: 100 per window

### Admin Rate Limits
- **Standard Admin Operations**: 10 requests per 15 minutes
- **Critical Operations** (draw, distribute, unstake): 5 requests per hour

Rate limit information is returned in response headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Time when the rate limit resets

---

## User Endpoints

### 1. Get User Stats

Retrieve comprehensive statistics for a user's treasury.

**Endpoint**: `GET /user/:address/stats`

**Parameters**:
- `address` (path, required): Casper public key (hex format starting with 01 or 02)

**Response**:
```json
{
  "public_key": "0203abc...def",
  "total_deposited": "1000000000000",
  "current_balance": "950000000000",
  "pending_unstake": "50000000000",
  "pvcspr_balance": "1000000000000",
  "first_deposit_date": "2024-01-15T10:30:00.000Z",
  "last_activity_date": "2024-12-20T14:22:00.000Z",
  "total_rewards": "25000000000",
  "win_count": 3
}
```

**Example**:
```bash
curl http://localhost:3000/api/v1/user/0203abc...def/stats
```

---

### 2. Get User Transaction History

Retrieve paginated transaction history for a user.

**Endpoint**: `GET /user/:address/history`

**Parameters**:
- `address` (path, required): Casper public key
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20, max: 100)
- `type` (query, optional): Filter by transaction type (`Deposit`, `Withdrawal`, `Reward`, `Unstake`)

**Response**:
```json
{
  "public_key": "0203abc...def",
  "page": 1,
  "limit": 20,
  "total": 45,
  "total_pages": 3,
  "transactions": [
    {
      "type": "Deposit",
      "amount": "500000000000",
      "deploy_hash": "abc123...",
      "timestamp": "2024-12-20T10:30:00.000Z",
      "block_height": 1234567
    },
    {
      "type": "Reward",
      "amount": "10000000000",
      "deploy_hash": "def456...",
      "timestamp": "2024-12-19T15:20:00.000Z",
      "block_height": 1234500
    }
  ]
}
```

**Example**:
```bash
curl "http://localhost:3000/api/v1/user/0203abc...def/history?page=1&limit=10&type=Deposit"
```

---

### 3. Get User Reward History

Retrieve all prizes won by a user.

**Endpoint**: `GET /user/:address/rewards`

**Parameters**:
- `address` (path, required): Casper public key

**Response**:
```json
{
  "public_key": "0203abc...def",
  "total_wins": 3,
  "rewards": [
    {
      "draw_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": "50000000000",
      "timestamp": "2024-12-15T12:00:00.000Z",
      "rank": 1,
      "total_winners": 5
    },
    {
      "draw_id": "660e8400-e29b-41d4-a716-446655440001",
      "amount": "25000000000",
      "timestamp": "2024-12-08T12:00:00.000Z",
      "rank": 2,
      "total_winners": 5
    }
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/api/v1/user/0203abc...def/rewards
```

---

### 4. Get Vault Information

Retrieve public information about the vault (no authentication required).

**Endpoint**: `GET /vault/info`

**Response**:
```json
{
  "total_value_locked": "50000000000000",
  "total_participants": 142,
  "next_draw_date": "2024-12-25T12:00:00.000Z",
  "last_draw_date": "2024-12-18T12:00:00.000Z",
  "total_rewards_distributed": "5000000000000",
  "current_reward_pool": "250000000000"
}
```

**Example**:
```bash
curl http://localhost:3000/api/v1/vault/info
```

---

### 5. Get Draw History

Retrieve paginated history of completed draws.

**Endpoint**: `GET /vault/draws`

**Parameters**:
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 10, max: 50)

**Response**:
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "total_pages": 3,
  "draws": [
    {
      "draw_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "total_reward_pool": "100000000000",
      "winner_count": 5,
      "initiated_at": "2024-12-18T10:00:00.000Z",
      "completed_at": "2024-12-18T12:00:00.000Z",
      "winners": [
        {
          "public_key": "0203abc...def",
          "rank": 1,
          "reward_amount": "40000000000"
        }
      ]
    }
  ]
}
```

**Example**:
```bash
curl "http://localhost:3000/api/v1/vault/draws?page=1&limit=5"
```

---

## Admin Endpoints

All admin endpoints require the `X-Admin-Secret` header.

### 1. Get System Stats

Retrieve comprehensive system statistics.

**Endpoint**: `GET /admin/stats`

**Headers**:
```
X-Admin-Secret: your-admin-secret
```

**Response**:
```json
{
  "users": {
    "total": 150,
    "active": 142
  },
  "vault": {
    "total_locked": "50000000000000"
  },
  "draws": {
    "total": 25,
    "completed": 24,
    "pending": 1
  },
  "rewards": {
    "total_distributed": "5000000000000"
  }
}
```

**Example**:
```bash
curl -H "X-Admin-Secret: your-secret" \
  http://localhost:3000/api/v1/admin/stats
```

---

### 2. Process Unstake Requests

Trigger on-chain processing for mature unstake requests.

**Endpoint**: `POST /admin/process-unstake`

**Headers**:
```
X-Admin-Secret: your-admin-secret
Content-Type: application/json
```

**Body**:
```json
{
  "public_keys": [
    "0203abc...def",
    "0201xyz...uvw"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "deploy_hash": "stub_process_unstake_1703073600000_nonce_1",
  "public_keys": ["0203abc...def", "0201xyz...uvw"],
  "message": "Unstake processing initiated"
}
```

**Example**:
```bash
curl -X POST \
  -H "X-Admin-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"public_keys":["0203abc...def"]}' \
  http://localhost:3000/api/v1/admin/process-unstake
```

---

### 3. Draw Winners

Initiate a prize draw to select winners.

**Endpoint**: `POST /admin/draw`

**Headers**:
```
X-Admin-Secret: your-admin-secret
Content-Type: application/json
```

**Body**:
```json
{
  "winner_count": 5,
  "use_future_block": true,
  "block_offset": 10
}
```

**Parameters**:
- `winner_count` (integer, required): Number of winners to select (1-100)
- `use_future_block` (boolean, optional): Use future block hash for randomness (default: true)
- `block_offset` (integer, optional): Blocks to wait for future seed (default: 10)

**Response** (Immediate draw):
```json
{
  "success": true,
  "draw_id": "550e8400-e29b-41d4-a716-446655440000",
  "snapshot_id": "507f1f77bcf86cd799439011",
  "total_reward_pool": "100000000000",
  "winners": [
    {
      "public_key": "0203abc...def",
      "rank": 1,
      "tickets_won": 150,
      "reward_amount": "40000000000"
    }
  ],
  "status": "completed",
  "block_height_used": 1234567,
  "message": "Winners selected successfully"
}
```

**Response** (Pending draw):
```json
{
  "success": true,
  "draw_id": "550e8400-e29b-41d4-a716-446655440000",
  "snapshot_id": "507f1f77bcf86cd799439011",
  "total_reward_pool": "100000000000",
  "winners": [],
  "status": "pending",
  "block_height_used": 1234577,
  "message": "Draw pending - waiting for future block"
}
```

**Example**:
```bash
curl -X POST \
  -H "X-Admin-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"winner_count":5,"use_future_block":true,"block_offset":10}' \
  http://localhost:3000/api/v1/admin/draw
```

---

### 4. Finalize Pending Draw

Finalize a pending draw once the future block is available.

**Endpoint**: `POST /admin/draw/:draw_id/finalize`

**Headers**:
```
X-Admin-Secret: your-admin-secret
```

**Parameters**:
- `draw_id` (path, required): UUID of the pending draw

**Response**:
```json
{
  "success": true,
  "draw_id": "550e8400-e29b-41d4-a716-446655440000",
  "winners": [
    {
      "public_key": "0203abc...def",
      "rank": 1,
      "tickets_won": 150,
      "reward_amount": "40000000000"
    }
  ],
  "total_reward_pool": "100000000000",
  "message": "Draw finalized successfully"
}
```

**Example**:
```bash
curl -X POST \
  -H "X-Admin-Secret: your-secret" \
  http://localhost:3000/api/v1/admin/draw/550e8400-e29b-41d4-a716-446655440000/finalize
```

---

### 5. Distribute Rewards

Trigger on-chain reward distribution to winners.

**Endpoint**: `POST /admin/distribute-rewards`

**Headers**:
```
X-Admin-Secret: your-admin-secret
Content-Type: application/json
```

**Body**:
```json
{
  "draw_id": "550e8400-e29b-41d4-a716-446655440000",
  "dry_run": false
}
```

**Parameters**:
- `draw_id` (string, required): UUID of the completed draw
- `dry_run` (boolean, optional): Preview distribution without executing (default: false)

**Response**:
```json
{
  "success": true,
  "deploy_hash": "stub_distribute_rewards_550e8400_nonce_2",
  "draw_id": "550e8400-e29b-41d4-a716-446655440000",
  "winners_count": 5,
  "total_distributed": "100000000000",
  "message": "Rewards distribution initiated"
}
```

**Example**:
```bash
curl -X POST \
  -H "X-Admin-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"draw_id":"550e8400-e29b-41d4-a716-446655440000","dry_run":false}' \
  http://localhost:3000/api/v1/admin/distribute-rewards
```

---

### 6. Manual Deposit (Testing)

Manually process a deposit event (for testing purposes).

**Endpoint**: `POST /admin/manual-deposit`

**Headers**:
```
X-Admin-Secret: your-admin-secret
Content-Type: application/json
```

**Body**:
```json
{
  "public_key": "0203abc...def",
  "amount": "1000000000000",
  "deploy_hash": "manual_test_123"
}
```

**Parameters**:
- `public_key` (string, required): Casper public key
- `amount` (string, required): Amount in motes
- `deploy_hash` (string, required): Unique deploy hash

**Response**:
```json
{
  "success": true,
  "public_key": "0203abc...def",
  "amount": "1000000000000",
  "deploy_hash": "manual_test_123",
  "message": "Manual deposit processed"
}
```

**Example**:
```bash
curl -X POST \
  -H "X-Admin-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"public_key":"0203abc...def","amount":"1000000000000","deploy_hash":"test123"}' \
  http://localhost:3000/api/v1/admin/manual-deposit
```

---

### 7. Resync Events

Replay blockchain events from a specific block range.

**Endpoint**: `POST /admin/resync`

**Headers**:
```
X-Admin-Secret: your-admin-secret
Content-Type: application/json
```

**Body**:
```json
{
  "from_block": 1234500,
  "to_block": 1234600
}
```

**Parameters**:
- `from_block` (integer, required): Starting block height
- `to_block` (integer, optional): Ending block height (defaults to latest)

**Response**:
```json
{
  "success": true,
  "from_block": 1234500,
  "to_block": 1234600,
  "message": "Event resync completed (stub mode)"
}
```

**Example**:
```bash
curl -X POST \
  -H "X-Admin-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"from_block":1234500,"to_block":1234600}' \
  http://localhost:3000/api/v1/admin/resync
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": []
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid admin secret
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Validation Errors

Validation errors include detailed information:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["public_key"],
      "message": "Expected string, received number"
    }
  ]
}
```

---

## Data Models

### Amount Format

All amounts are represented as strings in **motes** (smallest unit of CSPR):
- 1 CSPR = 1,000,000,000 motes (10^9)
- Example: "1000000000000" = 1,000 CSPR

### Public Key Format

Casper public keys are hex-encoded strings:
- Start with `01` (Ed25519) or `02` (Secp256k1)
- Followed by 64 hexadecimal characters
- Example: `0203abc1234567890abcdef...` (66 characters total)

### Transaction Types

- `Deposit`: User deposits CSPR into the vault
- `Withdrawal`: User withdraws CSPR from the vault
- `Unstake`: User initiates unstaking (moves to pending)
- `Reward`: Prize winnings credited to user

### Draw Status

- `pending`: Draw created, waiting for future block
- `in_progress`: Draw is being processed
- `completed`: Draw completed successfully
- `failed`: Draw failed (error in process)

### Winner Selection Algorithm

1. **Snapshot Creation**: Captures all user balances at draw time
2. **Ticket Calculation**: 
   - Base: 1 ticket per 10 CSPR
   - Weighted by hold duration:
     - < 24 hours: Not eligible
     - 1-7 days: 1.0x
     - 7-30 days: 1.2x
     - 30-90 days: 1.5x
     - 90-180 days: 2.0x
     - 180-365 days: 2.5x
     - 365+ days: 3.0x
3. **Random Selection**: Deterministic selection using block hash as seed
4. **Reward Distribution**:
   - 1st place: 40%
   - 2nd place: 25%
   - 3rd place: 15%
   - 4th place: 10%
   - 5+ places: Split remaining 10%

---

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Application
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/casper-prize-vault

# Casper Network
CASPER_NODE_URL=http://localhost:11101
CASPER_SIDECAR_URL=http://localhost:18101
CASPER_NETWORK_NAME=casper-test
CONTRACT_HASH=hash-your-contract-here

# Admin Configuration
ADMIN_SECRET=your-super-secret-32-char-minimum
ADMIN_PUBLIC_KEY=your-admin-public-key
ADMIN_PRIVATE_KEY=your-admin-private-key

# Application Settings
DRAW_INTERVAL_HOURS=168
MIN_HOLD_DURATION_HOURS=24
REWARD_SPLIT_PERCENTAGE=50

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_RATE_LIMIT_MAX_REQUESTS=10
```

---

## Testing

### Using cURL

```bash
# Test user stats
curl http://localhost:3000/api/v1/user/0203abc...def/stats

# Test admin endpoint
curl -X POST \
  -H "X-Admin-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"public_key":"0203abc...def","amount":"1000000000000","deploy_hash":"test1"}' \
  http://localhost:3000/api/v1/admin/manual-deposit
```

### Using Postman

1. Import the endpoints from this documentation
2. Set up environment variables for `BASE_URL` and `ADMIN_SECRET`
3. Test each endpoint with sample data

---

## Support

For issues or questions:
- GitHub: [Repository Link]
- Documentation: [This file]
- Contact: [Your contact info]

---

## License

MIT License - See LICENSE file for details
