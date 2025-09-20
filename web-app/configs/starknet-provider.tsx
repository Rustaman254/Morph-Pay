import { InjectedConnector } from "starknet/Injected"

const connectors = [
    new InjectedConnector({
        options: {
            id: "argentX",
            name: "Ready Wallet (formerly Argent)",
        }
    }),
    new InjectedConnector({
        options:{
            id: "braavos",
            name: "Braavos"
        }
    })
]

return (
    <StarknetConfig 
        chains={[mainnet, sepolia]}
        provider={publicProvider()}
        connectors={connectors as Connector[]}
        explorer={voyager}></StarknetConfig>
)