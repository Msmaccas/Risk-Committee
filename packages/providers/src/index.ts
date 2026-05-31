import { EntityState, ProviderResult } from '../../core/src/index';

/**
 * Data structures returned by market data providers.  These interfaces
 * decouple the shape of provider output from the core domain models.  Each
 * provider wraps its results in a `ProviderResult<T>` to capture metadata
 * such as confidence, timestamps and error states.  See `core` for
 * definitions of `EntityState` and `ProviderResult`.
 */

// Simple volatility estimate for a security.  Expressed as annualised standard deviation.
export interface VolatilityData {
  volatility: number;
}

// Factor exposures for a security.  Keys represent factor names and values are
// numeric exposures (e.g. 0.5 for half the market beta).
export interface FactorExposureData {
  exposures: Record<string, number>;
}

// Event risk captures the probability of significant upcoming events (earnings,
// regulatory announcements, etc.) and enumerates them.
export interface EventRiskData {
  riskScore: number;
  events: string[];
}

// Liquidity quality is a unitless score between 0 and 1 indicating how
// tradable a security is.  Higher is better.
export interface LiquidityData {
  score: number;
}

/**
 * Interface that all market data providers must implement.  Providers are
 * dependency‑injected into workflows and agents so they can be swapped out
 * during testing or for different data sources.  They never throw
 * exceptions—errors are reported via the `state` and `warnings` fields in
 * `ProviderResult`.
 */
export interface MarketDataProvider {
  getVolatility(symbol: string): Promise<ProviderResult<VolatilityData>>;
  getFactorExposure(symbol: string): Promise<ProviderResult<FactorExposureData>>;
  getEventRisk(symbol: string): Promise<ProviderResult<EventRiskData>>;
  getLiquidity(symbol: string): Promise<ProviderResult<LiquidityData>>;
}

/**
 * A basic mock implementation of `MarketDataProvider`.  It generates
 * pseudo‑random metrics based on the current timestamp and symbol.  For
 * demonstration and tests, this class allows the system to operate without
 * external dependencies.  Values are bounded within reasonable ranges and
 * include simple warnings for extreme conditions.
 */
export class MockMarketDataProvider implements MarketDataProvider {
  private now(): Date {
    return new Date();
  }

  async getVolatility(symbol: string): Promise<ProviderResult<VolatilityData>> {
    // Derive a deterministic pseudo‑random value from the symbol
    const hash = Array.from(symbol).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const base = (hash % 100) / 200; // range [0,0.495]
    const volatility = base + Math.random() * 0.05;
    const warnings: string[] = volatility > 0.4 ? ['High volatility estimate'] : [];
    return {
      source: 'MockMarketDataProvider',
      providerTimestamp: this.now(),
      receivedTimestamp: this.now(),
      confidence: volatility > 0.4 ? 0.5 : 0.9,
      state: EntityState.OK,
      warnings,
      schemaVersion: '1.0.0',
      data: { volatility }
    };
  }

  async getFactorExposure(symbol: string): Promise<ProviderResult<FactorExposureData>> {
    // Generate exposures across three illustrative factors
    const exposures: Record<string, number> = {
      growth: Math.random(),
      value: Math.random(),
      momentum: Math.random()
    };
    return {
      source: 'MockMarketDataProvider',
      providerTimestamp: this.now(),
      receivedTimestamp: this.now(),
      confidence: 0.8,
      state: EntityState.OK,
      warnings: [],
      schemaVersion: '1.0.0',
      data: { exposures }
    };
  }

  async getEventRisk(symbol: string): Promise<ProviderResult<EventRiskData>> {
    // Simulate occasional upcoming events
    const hasEvent = Math.random() < 0.3;
    const events = hasEvent ? ['earnings'] : [];
    const riskScore = hasEvent ? 0.8 : 0.1;
    return {
      source: 'MockMarketDataProvider',
      providerTimestamp: this.now(),
      receivedTimestamp: this.now(),
      confidence: 0.9,
      state: EntityState.OK,
      warnings: [],
      schemaVersion: '1.0.0',
      data: { riskScore, events }
    };
  }

  async getLiquidity(symbol: string): Promise<ProviderResult<LiquidityData>> {
    const score = Math.random();
    const warnings: string[] = score < 0.2 ? ['Low liquidity score'] : [];
    return {
      source: 'MockMarketDataProvider',
      providerTimestamp: this.now(),
      receivedTimestamp: this.now(),
      confidence: 0.9,
      state: EntityState.OK,
      warnings,
      schemaVersion: '1.0.0',
      data: { score }
    };
  }
}

/**
 * Factory function for constructing a mock provider.  Consumers should call
 * this rather than instantiating `MockMarketDataProvider` directly, allowing
 * future injection of more complex behaviour.
 */
export function createMockProvider(): MarketDataProvider {
  return new MockMarketDataProvider();
}
