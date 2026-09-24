import type { Store, StoreId } from "@/lib/types";

export const STORES: Store[] = [
  {
    id: "bow-valley",
    name: "Bow Valley Market",
    neighbourhood: "Kensington",
    note: "Everyday prices, big produce section",
  },
  {
    id: "chinook-fresh",
    name: "Chinook Fresh",
    neighbourhood: "Beltline",
    note: "A little pricier, open late",
  },
  {
    id: "foothills-food",
    name: "Foothills Food Co.",
    neighbourhood: "Shawnessy",
    note: "Lowest prices, smaller selection",
  },
];

export function getStore(id: StoreId): Store {
  return STORES.find((s) => s.id === id) ?? STORES[0];
}
