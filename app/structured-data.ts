import { siteCopy } from "./copy/site";
import { languages, localePath, type Lang } from "./i18n";
import { ringRenders } from "./product-visual";
import { site, type NavigationPath } from "./site";
import { finishes, preorderPrice, regularPrice } from "./store/product";

/* schema.org data shared by the pages, in the page's language. Ids let the
   pieces refer to each other. */

const organizationId = `${site.url}/#organization`;
const websiteId = `${site.url}/#website`;
const productId = `${site.url}/#product`;
const url = (lang: Lang, path: string) => `${site.url}${localePath(lang, path)}`;

export const organization = {
  "@type": "Organization",
  "@id": organizationId,
  name: site.organization,
  alternateName: site.name,
  url: `${site.url}/`,
  email: site.email,
  logo: {
    "@type": "ImageObject",
    url: `${site.url}/logo.svg`,
    width: 251,
    height: 251,
  },
  sameAs: site.social.map((profile) => profile.url),
};

export function website(lang: Lang) {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${site.url}/`,
    name: site.name,
    alternateName: site.organization,
    description: siteCopy[lang].description,
    inLanguage: languages[lang].htmlLang,
    publisher: { "@id": organizationId },
    about: { "@id": productId },
  };
}

export function product(lang: Lang) {
  const copy = siteCopy[lang];
  return {
    "@type": "Product",
    "@id": productId,
    name: `${site.name} R1`,
    description: copy.product.description,
    url: url(lang, "/store"),
    image: Object.values(ringRenders).map((render) => `${site.url}${render.src}`),
    brand: { "@type": "Brand", name: site.name },
    manufacturer: { "@id": organizationId },
    category: copy.product.category,
    color: finishes.map((finish) => copy.finishes[finish.id]).join(", "),
    material: copy.product.material,
    width: { "@type": "QuantitativeValue", value: 8, unitCode: "MMT" },
    offers: {
      "@type": "Offer",
      url: url(lang, "/store"),
      price: preorderPrice,
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/StrikethroughPrice",
        price: regularPrice,
        priceCurrency: "USD",
      },
      availability: "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": organizationId },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      },
    },
  };
}

export function breadcrumb(lang: Lang, path: NavigationPath) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: site.name,
        item: url(lang, "/"),
      },
      ...(path !== "/"
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: siteCopy[lang].navigation[path],
              item: url(lang, path),
            },
          ]
        : []),
    ],
  };
}

/** Serialises a graph for a <script type="application/ld+json"> tag. */
export function jsonLd(...items: object[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": items,
  }).replace(/</g, "\\u003c");
}
