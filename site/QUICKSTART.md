# Spark - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or compatible
- pnpm package manager
- Casper Signer browser extension (for wallet connection)

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

The app will be available at `http://localhost:5173` (or the next available port).

## 🎯 Using the Application

### 1. Connect Your Wallet

- Click "Connect Wallet" in the navigation bar
- Approve the connection in Casper Signer extension
- Your wallet address will appear in the navigation

### 2. Explore the Landing Page

The landing page features:
- **Hero section** with Three.js animated scene
- **Live vault statistics** (TVL, participants, rewards)
- **Feature cards** explaining the benefits
- **How It Works** section with step-by-step guide

### 3. View Dashboard

Navigate to `/dashboard` to see:
- Your personal stats (deposits, balance, rewards, wins)
- Recent transactions
- Prize history
- Global vault information

### 4. Deposit CSPR

1. Go to `/deposit`
2. Enter amount to deposit (minimum 10 CSPR)
3. Click "Deposit CSPR"
4. Confirm the transaction (stub implementation)
5. Receive success confirmation with deploy hash

**Note**: In the hackathon version, this is a stub. In production, it would:
- Create a real deploy
- Sign with your wallet
- Submit to Casper Network
- Wait for confirmation

### 5. Withdraw CSPR

1. Go to `/withdraw`
2. Enter amount to withdraw
3. Click "Withdraw CSPR"
4. Note the unstaking period information
5. Receive success confirmation

## 🎨 Design Features

### Color Palette
- **Primary**: Cyan (#06b6d4, #0ea5e9)
- **Secondary**: Blue (#3b82f6, #2563eb)
- **Accent**: Purple (#a855f7)
- **Background**: Zinc-950 (#09090b)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#eab308)

### Typography
- Font: Inter (system fallback)
- Headings: Bold with gradient text
- Body: Regular weight, zinc-50/zinc-400

### Animations
- Three.js 3D scene on landing page
- Framer Motion transitions
- Hover effects on cards and buttons
- Smooth page transitions

## 📊 API Integration

The app connects to the Casper Prize Vault API:

### Endpoints Used

1. **GET /vault/info**
   - Fetches global vault statistics
   - No authentication required
   - Updates in real-time

2. **GET /user/:address/stats**
   - Gets user's deposit and reward stats
   - Requires connected wallet

3. **GET /user/:address/history**
   - Retrieves transaction history
   - Supports pagination and filtering

4. **GET /user/:address/rewards**
   - Lists all prizes won by user

### API Configuration

Update `.env` to change the API endpoint:
```env
VITE_API_BASE_URL=http://your-api-url/api/v1
```

## 🔧 Development

### File Structure

```
src/
├── components/
│   ├── three/              # 3D scene components
│   │   ├── Scene.tsx       # Animated sphere, particles
│   │   └── HeroScene.tsx   # Canvas wrapper
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── Navigation.tsx      # Main navigation
├── contexts/
│   └── CasperWalletContext.tsx  # Wallet state
├── lib/
│   ├── api.ts              # API client
│   ├── constants.ts        # App constants
│   └── utils.ts            # Utilities
├── pages/
│   ├── LandingPage.tsx
│   ├── DashboardPage.tsx
│   ├── DepositPage.tsx
│   └── WithdrawPage.tsx
├── App.tsx
└── main.tsx
```

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in `Navigation.tsx`

### Customizing Styles

- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Inline with Tailwind classes

## 🐛 Troubleshooting

### Wallet Not Connecting

1. Ensure Casper Signer extension is installed
2. Check extension is unlocked
3. Try refreshing the page
4. Clear localStorage and reconnect

### API Errors

1. Verify API is running at configured URL
2. Check network connectivity
3. Inspect browser console for errors
4. Verify wallet address is valid

### Build Errors

1. Clear node_modules: `rm -rf node_modules pnpm-lock.yaml`
2. Reinstall: `pnpm install`
3. Clear Vite cache: `rm -rf .vite`
4. Rebuild: `pnpm build`

## 📝 Notes

### Stub Implementations

The following features use stubs in the hackathon version:

- **Deposit**: Generates fake deploy hash
- **Withdraw**: Generates fake deploy hash
- **Smart Contract**: No real contract interaction
- **Transaction Signing**: Simulated

### Production Requirements

For production deployment, you'll need:

1. **Deployed Smart Contract**
   - Contract hash
   - Entry point names
   - Deploy parameters

2. **Real Wallet Integration**
   - Proper deploy creation
   - Transaction signing
   - Network submission
   - Confirmation handling

3. **Backend API**
   - Running Casper Prize Vault API
   - Database for user data
   - Admin endpoints secured

## 🎯 Next Steps

1. **Test Locally**: Run the dev server and explore all pages
2. **Connect Wallet**: Install Casper Signer and connect
3. **Try Actions**: Test deposit/withdraw flows
4. **Check Dashboard**: View your stats and history
5. **Customize**: Adjust colors, copy, and features

## 🤝 Support

For issues or questions:
- Check the main README.md
- Review API_DOCUMENTATION.md
- Inspect browser console for errors
- Check network tab for API calls

---

Built with ⚡ by the Spark team
