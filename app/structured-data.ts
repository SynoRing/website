import { navigation, site } from "./site";
import { ringRenders } from "./product-visual";
import { finishes, preorderPrice, regularPrice } from "./store/product";

/* schema.org data shared by the pages. Ids let the pieces refer to each other. */

const organizationId = `${site.url}/#organization`;
const websiteId = `${site.url}/#website`;
const productId = `${site.url}/#product`;

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

export const website = {
  "@type": "WebSite",
  "@id": websiteId,
  url: `${site.url}/`,
  name: site.name,
  alternateName: site.organization,
  description: site.description,
  inLanguage: site.language,
  publisher: { "@id": organizationId },
  about: { "@id": productId },
};

export const product = {
  "@type": "Product",
  "@id": productId,
  name: `${site.name} R1`,
  description:
    "A gesture control ring for AR and smart glasses. Tap, glide, hold, or circle to select, scroll, and adjust what you see.",
  url: `${site.url}/store`,
  image: Object.values(ringRenders).map((render) => `${site.url}${render.src}`),
  brand: { "@type": "Brand", name: site.name },
  manufacturer: { "@id": organizationId },
  category: "Wearable gesture controller",
  color: finishes.map((finish) => finish.name).join(", "),
  material: "Ceramic, stainless steel",
  width: { "@type": "QuantitativeValue", value: 8, unitCode: "MMT" },
  offers: {
    "@type": "Offer",
    url: `${site.url}/store`,
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

export function breadcrumb(path: string) {
  const page = navigation.find(([href]) => href === path);
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: site.name,
        item: `${site.url}/`,
      },
      ...(page && path !== "/"
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: page[1],
              item: `${site.url}${path}`,
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
