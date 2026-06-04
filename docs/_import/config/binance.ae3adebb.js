// src/config/binance.js
// Configuración para el consumo de la API pública de Binance.
// Mover cualquier valor "ajustable" aquí permite cambiar el comportamiento
// sin tocar la lógica de fetch ni de visualización.

export const binanceConfig = {
  // Endpoint público que devuelve precios actuales de todos los pares.
  // Documentación: https://api.binance.com/api/v3/ticker/price
  apiUrl: "https://api.binance.com/api/v3/ticker/price",

  // Símbolos a seguir. Cada uno es un par "BASE+QUOTE" sin separador.
  // Para agregar más, búscalos en la lista completa de Binance.
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

  // Configuración del slider de intervalo (en segundos).
  intervalo: {
    min: 1,
    max: 30,
    default: 5
  }
};