# ⚡ Spark - Casper Prize Vault

A no-loss DeFi savings protocol built on the Casper Network. Stake CSPR, earn rewards, and win substantial prizes—all while keeping your principal 100% safe.

## 🎯 Features

- **No-Loss Guarantee**: Your principal is always protected
- **Weekly Prize Draws**: Win prizes from pooled staking rewards
- **Native CSPR Staking**: Automatic 8-12% APY from Casper Network
- **Liquid pvCSPR Tokens**: Trade or use in other DeFi protocols
- **Decentralized & Trustless**: Fully on-chain smart contracts
- **Instant Participation**: Connect wallet and start earning immediately

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with dark mode
- **3D Graphics**: Three.js + React Three Fiber
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Wallet**: Casper JS SDK
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Notifications**: Sonner

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Casper Network Configuration
VITE_NODE_ADDRESS=http://localhost:11101/rpc
VITE_NETWORK_NAME=casper-test
VITE_CONTRACT_HASH=hash-placeholder
```

## 🎨 Design Philosophy

Spark combines a **finance-focused** aesthetic with **cyberpunk** elements:

- Dark mode with cyan/blue gradient accents
- Futuristic Three.js animations on landing page
- Smooth transitions and micro-interactions
- Clear, compelling copy emphasizing returns and safety
- Grid patterns and particle effects for depth

## 📱 Pages

### Landing Page (`/`)
- Hero section with Three.js animated scene
- Feature cards highlighting key benefits
- Step-by-step "How It Works" section
- Real-time vault statistics

### Dashboard (`/dashboard`)
- User stats (deposits, balance, rewards, wins)
- Vault information (TVL, participants, next draw)
- Recent transaction history
- Prize history with winnings

### Deposit (`/deposit`)
- Form to deposit CSPR into vault
- Stub implementation for hackathon
- Clear information about what happens next
- Success confirmation with deploy hash

### Withdraw (`/withdraw`)
- Form to withdraw/unstake CSPR
- Unstaking period information
- Success confirmation with timeline

## 🔐 Casper Wallet Integration

The app uses the Casper Signer browser extension for wallet connectivity:

1. Install [Casper Signer](https://chrome.google.com/webstore) extension
2. Create or import a wallet
3. Connect wallet in the app
4. Session persists in localStorage

## 🧩 Project Structure

```
src/
├── components/
│   ├── three/          # Three.js 3D components
│   ├── ui/             # Reusable UI components
│   └── Navigation.tsx  # Main navigation bar
├── contexts/
│   └── CasperWalletContext.tsx  # Wallet state management
├── lib/
│   ├── api.ts          # API client and utilities
│   ├── constants.ts    # App constants
│   └── utils.ts        # Helper functions
├── pages/
│   ├── LandingPage.tsx
│   ├── DashboardPage.tsx
│   ├── DepositPage.tsx
│   └── WithdrawPage.tsx
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## 🌐 API Integration

The app integrates with the Casper Prize Vault API:

- **User Stats**: `GET /user/:address/stats`
- **Transaction History**: `GET /user/:address/history`
- **Reward History**: `GET /user/:address/rewards`
- **Vault Info**: `GET /vault/info`
- **Draw History**: `GET /vault/draws`

See `API_DOCUMENTATION.md` for full API details.

## 🎮 Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## 🔮 Future Enhancements

- Real Casper contract integration (currently using stubs)
- Advanced prize distribution visualization
- User settings and preferences
- Mobile-responsive improvements
- Dark/light theme toggle
- Multi-language support
- Advanced analytics dashboard

## 📝 Notes

- Deposit/withdrawal functionality uses **stub implementations** for the hackathon
- Real production deployment would require:
  - Deployed Casper smart contract
  - Contract hash configuration
  - Proper deploy creation and signing
  - Network interaction for confirmations

## 🤝 Contributing

This is a hackathon project for the Casper Prize Vault. For questions or improvements, please reach out!

## 📄 License

MIT

---

Built with ⚡ by the Spark team


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
