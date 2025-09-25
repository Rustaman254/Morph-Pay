// types and dummy data

export type Mode = "swap" | "send";
export type Tab = "BUY" | "SELL" | "fiat" | "crypto";

export interface Token {
  symbol: "ETH" | "USDT" | "BNB";
  name: string;
  logo: string;
  balance: number;
}

export interface Country {
  name: string;
  code: string; // ISO 3166-1-alpha-2
  currency: string;
  rate: number;
  networks: string[];
}

export const TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", logo: "/ethereum-eth-logo.png", balance: 2.543 },
  { symbol: "USDT", name: "Tether USD", logo: "/tether-usdt-logo.png", balance: 403.44 },
  { symbol: "BNB", name: "Binance Coin", logo: "/bnb-bnb-logo.png", balance: 5.32 }
];

export const COUNTRIES: Country[] = [
  { name: "Kenya", code: "ke", currency: "KES", rate: 160, networks: ["Mpesa", "Airtel Money", "Telkom"] },
  { name: "Nigeria", code: "ng", currency: "NGN", rate: 950, networks: ["MTN", "Airtel", "Glo", "9mobile"] },
  { name: "USA", code: "us", currency: "USD", rate: 1, networks: ["T-Mobile", "AT&T", "Verizon"] },
  { name: "Tanzania", code: "tz", currency: "TZS", rate: 2500, networks: ["Vodacom", "Airtel", "Tigo", "Halotel"] },
  { name: "Uganda", code: "ug", currency: "UGX", rate: 3800, networks: ["MTN", "Airtel", "Africell"] }
];

export const TOKEN_TO_USD: Record<"ETH" | "USDT" | "BNB", number> = {
  ETH: 2000,
  USDT: 1,
  BNB: 310
};

export const MARKET_RATES: Record<string, number> = {
  "ETH:USDT": 2000,
  "USDT:ETH": 1 / 2000,
  "ETH:BNB": 6.28,
  "BNB:ETH": 1 / 6.28,
  "USDT:BNB": 0.00314,
  "BNB:USDT": 318,
};
