import type {I18nBase} from '@shopify/hydrogen';
import type {
  CurrencyCode,
  ProductFilter,
} from "@shopify/hydrogen/storefront-api-types";
import { COUNTRIES } from "../helpers/const";

export type I18nLocale = I18nBase & {
  currency: CurrencyCode;
  label: string;
  pathPrefix?: string;
};


export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  let firstPathPart = `/${url.pathname.substring(1).split("/")[0].toLowerCase()}`;
  firstPathPart = firstPathPart.replace(".data", "");

  return COUNTRIES[firstPathPart]
    ? {
        ...COUNTRIES[firstPathPart],
        pathPrefix: firstPathPart,
      }
    : {
        ...COUNTRIES.default,
        pathPrefix: "",
      };
}
