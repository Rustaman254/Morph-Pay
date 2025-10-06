import axios from "axios";

type Currency = "KES" | "NGN";
type Token = "USDC" | "USDT";

export async function getUsdcToKesRate(currency:Currency, token:Token): Promise<number> {
  const resp = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${token}`);
  const rate = resp.data.data.rates[currency];
  return Number(rate); 
}