export const binanceConfig = {
  // Endpoint público que devuelve precios actuales.
  apiUrl: "https://api.binance.com/api/v3/ticker/price",

  // Sgnificado de los pares "trackeados". Cada uno es un par "BASE+QUOTE".
  simbolos: [
    "BTCUSDT",  // Bitcoin
    "ETHUSDT",  // Ethereum
    "BNBUSDT",  // Binance Coin
    "SOLUSDT",  // Solana
    "DOGEUSDT", // Dogecoin
    "XRPUSDT",  // Ripple
    "ADAUSDT",  // Cardano
    "AVAXUSDT"  // Avalanche
  ],

  // Configuración del slider de intervalo en segundos.
  intervalo: {
    min: 1,
    max: 30,
    default: 5
  }
};