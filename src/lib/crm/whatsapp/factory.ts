import type { IWhatsAppProvider } from './provider.interface';
import { MetaWhatsAppProvider } from './meta-provider';
import { GreenApiWhatsAppProvider } from './green-api-provider';

export class WhatsAppProviderFactory {
  private static instance: IWhatsAppProvider | null = null;
  private static mockOverride: IWhatsAppProvider | null = null;

  public static setMockProvider(provider: IWhatsAppProvider | null) {
    this.mockOverride = provider;
  }

  public static getProvider(): IWhatsAppProvider {
    if (this.mockOverride) {
      return this.mockOverride;
    }

    if (this.instance) {
      return this.instance;
    }

    const providerType = (process.env.WHATSAPP_PROVIDER || 'green_api').trim().toLowerCase();

    if (providerType === 'meta') {
      this.instance = new MetaWhatsAppProvider();
    } else {
      this.instance = new GreenApiWhatsAppProvider();
    }

    return this.instance;
  }

  public static reset() {
    this.instance = null;
    this.mockOverride = null;
  }
}
