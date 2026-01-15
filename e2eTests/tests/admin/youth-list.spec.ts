import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has title", async ({ page }) => {
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Nuori Espoo jäsenkortti");
});

test("test", async ({ page }) => {
  await page.getByRole("link", { name: "Espoo AD" }).click();
  await page.getByRole("button", { name: "Kirjaudu" }).click();
  await page.getByRole("menuitem", { name: "Nuoret" }).click();
  await expect(
    page.getByText("Kohteessa Nuoret ei ole sisältöä.")
  ).toBeVisible();
});
