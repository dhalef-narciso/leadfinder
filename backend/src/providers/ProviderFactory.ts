import { ISearchProvider } from './SearchProvider.interface';
import { MockSearchProvider } from './MockSearchProvider';
import { SerpApiProvider } from './SerpApiProvider';
import { GoogleSearchProvider } from './GoogleSearchProvider';
import { IMapsSearchProvider } from './MapsSearchProvider.interface';
import { SerpApiMapsProvider } from './SerpApiMapsProvider';
import { MockMapsProvider } from './MockMapsProvider';

export class ProviderFactory {
  private static cachedSearchProvider: ISearchProvider | null = null;
  private static activeSearchProviderName: string = '';

  private static cachedMapsProvider: IMapsSearchProvider | null = null;
  private static activeMapsProviderName: string = '';

  /**
   * Returns search provider for enrichment (Google Search)
   */
  static getProvider(overrideType?: string): ISearchProvider {
    const providerType = (overrideType || process.env.SEARCH_PROVIDER || 'mock').toLowerCase();

    if (this.cachedSearchProvider && this.activeSearchProviderName === providerType) {
      return this.cachedSearchProvider;
    }

    let provider: ISearchProvider;
    switch (providerType) {
      case 'serpapi':
        provider = new SerpApiProvider();
        break;
      case 'google':
      case 'googlesearch':
        provider = new GoogleSearchProvider();
        break;
      case 'mock':
      default:
        provider = new MockSearchProvider();
        break;
    }

    this.cachedSearchProvider = provider;
    this.activeSearchProviderName = providerType;
    return provider;
  }

  /**
   * Returns Google Maps provider for business discovery
   */
  static getMapsProvider(overrideType?: string): IMapsSearchProvider {
    const defaultMaps = process.env.MAPS_PROVIDER || (process.env.SEARCH_API_KEY ? 'serpapi' : 'mock');
    const providerType = (overrideType || defaultMaps).toLowerCase();

    if (this.cachedMapsProvider && this.activeMapsProviderName === providerType) {
      return this.cachedMapsProvider;
    }

    let provider: IMapsSearchProvider;
    switch (providerType) {
      case 'serpapi':
        provider = new SerpApiMapsProvider();
        break;
      case 'mock':
      default:
        provider = new MockMapsProvider();
        break;
    }

    this.cachedMapsProvider = provider;
    this.activeMapsProviderName = providerType;
    return provider;
  }

  static getActiveProviderName(): string {
    return process.env.SEARCH_PROVIDER || 'mock';
  }

  static getActiveMapsProviderName(): string {
    return process.env.MAPS_PROVIDER || (process.env.SEARCH_API_KEY ? 'serpapi' : 'mock');
  }
}
