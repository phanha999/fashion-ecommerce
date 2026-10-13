import { shopifyFetch } from './client';
export async function getLocalization(context) {
  const data = await shopifyFetch(`query Localization {
    localization {
      country { isoCode name currency { isoCode symbol } }
      language { isoCode endonymName }
      availableLanguages { isoCode endonymName }
      availableCountries { isoCode name currency { isoCode symbol } availableLanguages { isoCode endonymName } }
    }
  }`, {}, context);
  return data.localization;
}
