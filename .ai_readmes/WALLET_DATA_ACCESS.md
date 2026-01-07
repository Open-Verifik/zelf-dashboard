# Wallet Data Access in Zelf Dashboard

## Overview

The wallet data is now automatically saved to `localStorage` when a user successfully logs in through the authentication flow. This includes all blockchain addresses associated with the user's account.

## Wallet Data Structure

The wallet object contains the following addresses:

```typescript
{
	ethAddress: string; // Ethereum address
	btcAddress: string; // Bitcoin address
	solanaAddress: string; // Solana address
	suiAddress: string; // Sui address
}
```

## How to Access Wallet Data

### Method 1: Using AuthService (Recommended)

```typescript
import { AuthService } from "app/core/auth/auth.service";

export class YourComponent {
	constructor(private _authService: AuthService) {}

	ngOnInit() {
		const wallet = this._authService.wallet;

		if (wallet) {
			console.log("ETH Address:", wallet.ethAddress);
			console.log("BTC Address:", wallet.btcAddress);
			console.log("Solana Address:", wallet.solanaAddress);
			console.log("Sui Address:", wallet.suiAddress);
		}
	}
}
```

### Method 2: Direct localStorage Access

```typescript
const walletData = localStorage.getItem("wallet");
if (walletData) {
	const wallet = JSON.parse(walletData);
	console.log("Wallet:", wallet);
}
```

## Example: Displaying Wallet Addresses in a Component

```typescript
import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/core/auth/auth.service";

@Component({
	selector: "app-wallet-display",
	template: `
		<div *ngIf="wallet">
			<h3>Your Wallet Addresses</h3>
			<div><strong>Ethereum:</strong> {{ wallet.ethAddress }}</div>
			<div><strong>Bitcoin:</strong> {{ wallet.btcAddress }}</div>
			<div><strong>Solana:</strong> {{ wallet.solanaAddress }}</div>
			<div><strong>Sui:</strong> {{ wallet.suiAddress }}</div>
		</div>
	`,
})
export class WalletDisplayComponent implements OnInit {
	wallet: any;

	constructor(private _authService: AuthService) {}

	ngOnInit() {
		this.wallet = this._authService.wallet;
	}
}
```

## Implementation Details

### When is the wallet data saved?

- The wallet data is saved during the sign-in process in `sign-in.component.ts`
- It's saved immediately after a successful authentication response
- Location: `onBiometricSuccess()` method, line ~372

### When is the wallet data cleared?

- The wallet data is automatically cleared when the user signs out
- Location: `auth.service.ts`, `signOut()` method

### API Response Structure

The wallet data comes from the `/api/clients/auth` endpoint response:

```json
{
  "data": {
    "wallet": {
      "ethAddress": "0x...",
      "btcAddress": "bc1...",
      "solanaAddress": "...",
      "suiAddress": "0x..."
    },
    "zelfProof": "...",
    "zelfAccount": { ... },
    "token": "..."
  }
}
```

## Benefits

- ✅ Easy access to wallet addresses throughout the application
- ✅ No need to make additional API calls to fetch wallet data
- ✅ Automatically persisted across page refreshes
- ✅ Automatically cleared on logout for security
- ✅ Consistent with other auth data (zelfProof, zelfAccount)

## Notes

- The wallet data is stored as a JSON string in localStorage
- Always check if wallet data exists before accessing it
- The wallet getter in AuthService returns `null` if no wallet data is found
