/**
 * External API Service for Crypto prices and Exchange Rate
 */

const EXCHANGE_RATE_URL = import.meta.env.VITE_EXCHANGE_RATE_URL || 
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'

const FREE_CRYPTO_BASE_URL = import.meta.env.VITE_FREE_CRYPTO_BASE_URL || 'https://api.freecryptoapi.com/v1'
const FREE_CRYPTO_API_KEY = import.meta.env.VITE_FREE_CRYPTO_API_KEY || ''

/**
 * Default fallback prices in USD in case of offline/network issues
 */
const FALLBACK_PRICES = {
  BTC: 80170.0,
  ETH: 2325.0,
  SOL: 101.5,
  BNB: 585.0,
  DOGE: 0.14,
  XRP: 0.54,
  ADA: 0.35,
  USDT: 1.0,
  USDC: 1.0
}

/**
 * Fetch USD to IDR exchange rate
 * @returns {Promise<{ rate: number, date: string, source: string, rawUsdMap: Object }>}
 */
export async function fetchUsdToIdrRate() {
  try {
    const res = await fetch(EXCHANGE_RATE_URL)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const data = await res.json()
    
    if (data && data.usd && data.usd.idr) {
      return {
        rate: Number(data.usd.idr),
        date: data.date || new Date().toISOString().split('T')[0],
        source: 'Currency-API (Fawaz Ahmed)',
        rawUsdMap: data.usd
      }
    }
    throw new Error('Invalid exchange rate response structure')
  } catch (err) {
    console.warn('[Exchange API] Failed to fetch live USD-IDR rate, using fallback 16,250:', err)
    return {
      rate: 16250,
      date: new Date().toISOString().split('T')[0],
      source: 'Fallback Cache',
      rawUsdMap: null
    }
  }
}

/**
 * Fetch Crypto prices in USD
 * Uses FreeCryptoAPI with Bearer token (parses `item.last` / `item.price`);
 * falls back to currency-api USD map or cache.
 * @param {string[]} symbols - Array of tickers e.g. ['BTC', 'ETH', 'SOL']
 * @param {Object} [cachedUsdMap] - Optional rawUsdMap from fetchUsdToIdrRate
 * @returns {Promise<{ prices: Record<string, number>, meta: Record<string, Object>, source: string, lastUpdated: Date }>}
 */
export async function fetchCryptoPrices(symbols = ['BTC', 'ETH', 'SOL'], cachedUsdMap = null) {
  const result = { ...FALLBACK_PRICES }
  const meta = {}
  let source = 'Fallback Cache'

  // 1. Try FreeCryptoAPI if valid API key is present
  if (FREE_CRYPTO_API_KEY && FREE_CRYPTO_API_KEY !== 'your_freecryptoapi_key_here') {
    try {
      const querySymbols = symbols.join('+')
      const cleanBase = FREE_CRYPTO_BASE_URL.replace(/\/+$/, '')
      const url = `${cleanBase}/getData?symbol=${querySymbols}`

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${FREE_CRYPTO_API_KEY}`,
          'Accept': 'application/json'
        }
      })

      if (res.ok) {
        const data = await res.json()
        const list = data?.symbols || data?.data || (Array.isArray(data) ? data : null)
        
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(item => {
            if (item.symbol) {
              const sym = item.symbol.toUpperCase()
              // FreeCryptoAPI returns price in 'last' or 'price'
              const priceVal = item.last !== undefined ? Number(item.last) : Number(item.price)
              if (!isNaN(priceVal) && priceVal > 0) {
                result[sym] = priceVal
                meta[sym] = {
                  change24h: item.daily_change_percentage ? Number(item.daily_change_percentage) : 0,
                  highest: item.highest ? Number(item.highest) : null,
                  lowest: item.lowest ? Number(item.lowest) : null,
                  exchange: item.source_exchange || 'binance'
                }
              }
            }
          })
          source = 'FreeCryptoAPI (Live)'
          return { prices: result, meta, source, lastUpdated: new Date() }
        } else if (data && data.symbol) {
          const sym = data.symbol.toUpperCase()
          const priceVal = data.last !== undefined ? Number(data.last) : Number(data.price)
          if (!isNaN(priceVal) && priceVal > 0) {
            result[sym] = priceVal
            meta[sym] = {
              change24h: data.daily_change_percentage ? Number(data.daily_change_percentage) : 0
            }
            source = 'FreeCryptoAPI (Live)'
            return { prices: result, meta, source, lastUpdated: new Date() }
          }
        }
      } else {
        console.warn(`[FreeCryptoAPI] HTTP error ${res.status}`)
      }
    } catch (err) {
      console.warn('[FreeCryptoAPI] Error connecting, falling back to secondary source:', err)
    }
  }

  // 2. Use Currency-API USD rates (1 USD = X Crypto -> 1 Crypto = 1/X USD)
  try {
    let usdMap = cachedUsdMap
    if (!usdMap) {
      const res = await fetch(EXCHANGE_RATE_URL)
      if (res.ok) {
        const data = await res.json()
        usdMap = data?.usd
      }
    }

    if (usdMap) {
      symbols.forEach(sym => {
        const lower = sym.toLowerCase()
        if (usdMap[lower] && usdMap[lower] > 0) {
          result[sym.toUpperCase()] = 1 / usdMap[lower]
        }
      })
      source = 'Currency-API Global Feed'
      return { prices: result, meta, source, lastUpdated: new Date() }
    }
  } catch (err) {
    console.warn('[Crypto Price] Currency-API fallback error:', err)
  }

  return { prices: result, meta, source, lastUpdated: new Date() }
}
