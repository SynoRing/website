import { studioRenders, type MediaImage } from "../product-visual";

export const finishes = [
  {
    id: "space-gray",
    name: "Space Gray",
    swatch: "linear-gradient(135deg, #93989d, #32373b 65%, #636b70)",
  },
  {
    id: "platinum",
    name: "Platinum",
    swatch: "linear-gradient(135deg, #fff, #c8cccd 60%, #f0f1ed)",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    swatch: "linear-gradient(135deg, #f7dbcf, #bf8872 60%, #e8bda8)",
  },
  {
    id: "gold",
    name: "Gold",
    swatch: "linear-gradient(135deg, #ffebae, #b99445 65%, #ead18b)",
  },
] as const;
export type Finish = (typeof finishes)[number]["id"];
export const preorderPrice = 99;
export const regularPrice = 129;
export const storeRenders: Record<Finish, MediaImage | null> = studioRenders;
