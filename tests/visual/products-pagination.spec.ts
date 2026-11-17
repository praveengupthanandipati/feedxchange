import { expect, test } from "@playwright/test";
import type { Product } from "../../src/core/store/productsApi";
import { openScreen } from "./screens";

const products: Product[] = Array.from({ length: 21 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    name: `Product ${String(id).padStart(2, "0")}`,
    imageUrl: null,
    seoName: `product-${id}`,
    sku: `SKU-${id}`,
    description: "Test product",
    fileName: null,
    price: 100,
    categoryName: "Feed",
    categoryId: 1,
    productFeatures: null,
    weightClause: "mt",
    insertedTime: "2026-01-01T00:00:00",
    stock: 10,
    minimumQuantity: 1,
    maximumQuantity: 20,
    isActive: true,
    isDeleted: false,
    createdBy: 1,
    createdByName: "Test Admin",
    updatedByName: null,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
    productPriceHistoryResponse: [],
  };
});

test("returns to the selected product page from product details", async ({ page }) => {
  await openScreen(
    page,
    { name: "products-pagination", path: "/admin/products", signedIn: true },
    async (setupPage) => {
      await setupPage.route(/\/api\/product\/getallactiveproducts/i, (route) =>
        route.fulfill({ contentType: "application/json", body: JSON.stringify(products) }),
      );
      await setupPage.route(/\/api\/product\/getproductbyproductid/i, async (route) => {
        const id = Number(new URL(route.request().url()).searchParams.get("productId"));
        const product = products.find((entry) => entry.id === id);
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(product ?? null),
        });
      });
    },
  );

  await page.getByRole("button", { name: "3", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products\?page=3$/);

  const productLink = page.locator(".products-list__link").first();
  const productName = (await productLink.textContent())?.trim();
  if (!productName) throw new Error("Expected a product on page three.");
  await productLink.click();
  await expect(page.getByRole("heading", { name: productName, exact: true })).toBeVisible();

  await page.locator("a.product-view__back").click();
  await expect(page).toHaveURL(/\/admin\/products\?page=3$/);
  await expect(page.getByText("Showing 21-21 of 21 Results")).toBeVisible();
  await expect(page.locator(".products-list__link").first()).toHaveText(productName);

  await page.locator(".products-list__link").first().click();
  await expect(page.getByRole("heading", { name: productName, exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/admin\/products\?page=3$/);
  await expect(page.getByText("Showing 21-21 of 21 Results")).toBeVisible();
});
