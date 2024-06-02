## ShadowKey is solving wallet address reusability & anonymity problems


### Problems

Reduced Privacy: When an address is reused for multiple transactions, it becomes easier for third parties to track and analyze transaction patterns associated with that address. This compromises the privacy of both the sender and receiver, as their transaction history can be inferred from the publicly available blockchain data.

Linkability: Reusing addresses enables outside parties to link multiple transactions to a single user or entity. By analyzing transaction flows and patterns, adversaries can gain insights into the financial activities of individuals or organizations, potentially leading to identity disclosure or targeted attacks.

Security Risks: Address reuse increases the risk of security breaches and unauthorized access to funds. If an address is compromised or associated with a vulnerable system, all subsequent transactions made using that address are susceptible to exploitation, putting users' funds at risk.

Impact on Fungibility: Fungibility refers to the interchangeability of units within a currency system. Address reusability can impact fungibility by introducing tainted coins-coins associated with undesirable activities or histories. This can lead to discrimination against certain coins and undermine the fungibility of the entire currency system.

### Solution

Wallet dApp which automates the process of stealth wallet creation and management. The dApp allows to generate stealth addresses on demand for an asset receiver using elliptic curves and ephemeral keys, referencing the ERC-5564 Proposal.

Stealth addresses are generated by asset sender but the private keys are available only for the asset receiver. It is not possible to tie the stealth address to asset receiver for an outside actor.

The general usage flow of the dApp is the following:
1. Receiver registers to the platform, generates stealth meta-addresses and stores them on-chain.
2. Sender fetches the stealth meta-addresses of the receiver from the chain.
3. Sender uses the meta-addresses to generate a stealth wallet address for the receiver and sends assets to them.
4. Receiver scans the announced transaction events and finds out which stealth wallets belong to them.

### Challenges we ran into
Implementing cryptography methods for private data exchange.

Trying to concentrate while also chatting with nice people around the venue :)

### Inspiratios
https://vitalik.eth.limo/general/2023/01/20/stealth.html
https://eips.ethereum.org/EIPS/eip-5564

### MVP

URL: https://shadowkey-35bd86dea963.herokuapp.com/

### Smart Contracts

Registry: https://sepolia.lineascan.build/address/0xc039c13470be809bed1c2cd42339ccb22e0970f2

Announcer: https://sepolia.lineascan.build/address/0xc6b69d83db6d40b3b644436e3a36252801fc0f64

Stealth: https://sepolia.lineascan.build/address/0xa5f90284a54c9857be4d0c40fe4be23457c1ff9f


### Technology used

Web: NextJS, React, Chakra, Heroku.

Smart Contracts: Solidity, Hardhat


## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
