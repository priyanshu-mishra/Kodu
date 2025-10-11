import { ConnectButton, darkTheme } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const client = Client;

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "discord", "email", "x", "passkey", "phone", "apple"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];

function Example() {
  return (
    <ConnectButton
      client={client}
      connectModal={{ size: "compact" }}
      theme={darkTheme({
        colors: { accentText: "hsl(265, 46%, 52%)" },
      })}
      wallets={wallets}
    />
  );
}
