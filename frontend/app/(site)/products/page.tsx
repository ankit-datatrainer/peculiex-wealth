import { permanentRedirect } from "next/navigation";

/**
 * /products no longer has an overview page: every product is reached from the
 * "Products" dropdown in the main nav. The 308 itself is issued by
 * next.config.mjs before this route renders; this is the backstop for any
 * environment where that redirect table is not applied (it answers the same
 * 308 to "/").
 */
export default function ProductsRoute(): never {
  permanentRedirect("/");
}
