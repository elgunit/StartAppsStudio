/**
 * Non-sending browser regression checks for the studio's refined landing page.
 * The single real email check is deliberately separate from this smoke test.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.STUDIO_TEST_URL || "http://127.0.0.1:5000";
if (!["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname)) {
  throw new Error("Run this smoke check against development, not production.");
}
async function main() {
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const colorScheme of ["light", "dark"] as const) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      colorScheme,
      reducedMotion: "reduce",
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/track/active-visitor", (route) =>
      route.fulfill({ json: { success: true } }),
    );
    await page.route("**/api/contact", (route) => {
      errors.push("Unexpected contact submission in non-sending smoke check");
      return route.abort();
    });
    assert((await page.goto(baseUrl, { waitUntil: "networkidle" }))?.ok());
    const consent = page.getByRole("button", {
      name: "Continue without",
      exact: true,
    });
    if (await consent.isVisible()) await consent.click();
    assert.equal(await page.locator(".sas-nav").count(), 1);
    assert.equal(await page.locator(".sas-mobile-cta").count(), 0, "Floating free-plan bar must stay removed");
    await page.locator("#serviceTabGrow").click();
    assert.equal(await page.locator("#tab-grow .growth-card").count(), 8);
    assert.equal(await page.locator("#tab-grow .growth-card p").count(), 8, "Grow descriptions must not disappear");
    assert.equal(await page.locator("#tab-grow .growth-time-badge").count(), 8);
    assert(await page.locator("#tab-grow").isVisible());
    await page.locator("#serviceTabBuild").click();
    assert(await page.locator("#tab-build").isVisible());
    assert.equal(await page.locator("#pricing .price-card").count(), 4);
    assert.equal(await page.locator("#pricing .price-card.featured").count(), 1);
    assert(await page.locator("#pricing .mvp-card.featured").count());
    assert.equal(
      await page.locator("#custom-scale .special-feature").first().evaluate((feature) => getComputedStyle(feature).alignItems),
      "center",
      "Custom feature icons should align with their text",
    );
    const heights = await page.locator("#pricing .price-card").evaluateAll(
      (cards) => cards.map((card) => card.getBoundingClientRect().height),
    );
    assert(Math.max(...heights) - Math.min(...heights) < 3, "Unequal pricing heights");
    for (const card of await page.locator("#pricing .price-card").all()) {
      const features = card.locator(".price-feature:visible,.special-feature:visible");
      const before = await features.count();
      assert(before <= 3);
      await card.locator(".sas-included-toggle").click();
      assert((await features.count()) > before, "Included detail did not expand");
      await card.locator(".sas-included-toggle").click();
    }
    assert.equal(await page.locator("#faq details[open]").count(), 1);
    assert(await page.locator("#faq details").first().getAttribute("open") !== null);
    await page.locator("#faq details").nth(1).locator("summary").click();
    await page.waitForFunction(() => document.querySelectorAll("#faq details[open]").length === 1);
    assert.equal(await page.locator("#faq details[open]").count(), 1);
    assert(await page.locator("#faq details").nth(1).getAttribute("open") !== null);
    const quoteCount = await page.locator(".testimonial-card").count();
    for (let i = 0; i < quoteCount; i++) {
      assert.equal(await page.locator(".testimonial-card:visible").count(), 1);
      await page.locator("#sasQuoteNext").click();
    }
    await page.locator(".showcase-card").first().click();
    assert(await page.locator("#showcaseDetailModal").evaluate(
      (modal) => modal.classList.contains("open"),
    ));
    assert((await page.locator("#sdmTimelineValue").textContent())?.trim());
    await page.keyboard.press("Escape");
    assert(!(await page.locator("#showcaseDetailModal").evaluate(
      (modal) => modal.classList.contains("open"),
    )));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator(".sas-menu-button").click();
    assert.equal(await page.locator(".sas-menu-button").getAttribute("aria-expanded"), "true");
    await page.locator("#sasNavLinks a[href='#case-studies']").click();
    assert.equal(await page.locator(".sas-menu-button").getAttribute("aria-expanded"), "false");
    const descriptionToggle = page.locator(".pain-strip-item .sas-description-toggle").first();
    await descriptionToggle.click();
    assert.equal(await descriptionToggle.getAttribute("aria-expanded"), "true");
    await descriptionToggle.click();
    assert.equal(await descriptionToggle.getAttribute("aria-expanded"), "false");
    for (const width of [320, 360, 390, 768, 1024, 1200, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const layout = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        contentWidth: document.documentElement.scrollWidth,
        phoneHeight: document.querySelector(".hero-phone")?.getBoundingClientRect().height || 0,
        pricingAutoRows: getComputedStyle(document.querySelector("#pricing .pricing-grid")!).gridAutoRows,
        pricingColumns: getComputedStyle(document.querySelector("#pricing .pricing-grid")!).gridTemplateColumns.split(" ").length,
        customCtaLines: (() => {
          const cta = document.querySelector("#custom-scale .sas-price-cta");
          if (!cta) return 0;
          const range = document.createRange();
          range.selectNodeContents(cta);
          return range.getClientRects().length;
        })(),
        customCtaFits: (() => {
          const cta = document.querySelector("#custom-scale .sas-price-cta");
          if (!cta) return false;
          const range = document.createRange();
          range.selectNodeContents(cta);
          const style = getComputedStyle(cta);
          const available = cta.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          return range.getBoundingClientRect().width <= available + 1;
        })(),
      }));
      assert(layout.contentWidth <= layout.width + 1, `${width}px horizontal overflow`);
      assert(layout.phoneHeight < 350, "Phone preview stretched vertically");
      assert.equal(layout.customCtaLines, 1, `${width}px custom CTA should stay on one line`);
      assert(layout.customCtaFits, `${width}px custom CTA text should stay inside the button`);
      if (width <= 700) assert.equal(layout.pricingAutoRows, "auto", "Mobile pricing cards should use natural heights");
      const expectedPricingColumns = width > 1200 ? 4 : width > 700 ? 2 : 1;
      assert.equal(layout.pricingColumns, expectedPricingColumns, `${width}px pricing columns should match the responsive layout`);
    }
    assert.deepEqual(errors, [], `${colorScheme} browser errors`);
    console.log(`PASS ${colorScheme}: pricing, FAQ, all quotes, case study, mobile controls, 8 widths`);
    await page.close();
  }
} finally {
  await browser.close();
}
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
