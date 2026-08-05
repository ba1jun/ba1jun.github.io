import { getCollection } from "astro:content";
import { generateRss } from "../../scripts/collections";
import {
  ROUTE_COLLECTIONS,
  getRouteCollection,
} from "../../config/collections";
import type { APIContext } from "astro";

export async function getStaticPaths() {
  return ROUTE_COLLECTIONS.map((c) => ({ params: { collection: c.name } }));
}

export async function GET(context: APIContext) {
  const { collection } = context.params;
  const config = getRouteCollection(collection!);
  const entries = await getCollection(config.name);
  return generateRss(entries, config.name, context);
}
