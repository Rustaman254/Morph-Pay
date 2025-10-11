import { base } from "viem/chains";
import { http } from "viem";
import { createPrivySigner } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createSmartAccountClient } from "permissionless";

export async function getSponsoredSmartAccountClient(privyWalletId: string) {
  const privySigner = await createPrivySigner({
    privyWalletId,
    privyAppId: process.env.PRIVY_APP_ID!,
    privyAppSecret: process.env.PRIVY_APP_SECRET!,
    chainId: base.id,
  });

  const pimlicoClient = createPimlicoClient({
    chain: base,
    transport: http(
      `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.PIMLICO_API_KEY}`
    ),
    entryPoint: { address: process.env.ENTRY_POINT_ADDRESS!, version: "0.7" },
  });

  const smartAccountClient = await createSmartAccountClient({
    account: privySigner,
    chain: base,
    bundlerTransport: http(process.env.RPC_URL!),
    middleware: {
      sponsorUserOperation: pimlicoClient.sponsorUserOperation,
    },
  });

  return smartAccountClient;
}
