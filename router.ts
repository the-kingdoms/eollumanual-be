import { Request, Response, Router } from "express";
import { Browser, type Frame, type Page, launch } from "puppeteer";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

router.get("/api/crawl-naver-map", async (req: Request, res: Response) => {
  const { uri } = req.query;
  if (!uri) {
    res.status(400).json({ message: "uri is required" });
    return;
  }
  let browser: Browser | null = null;
  try {
    browser = await launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
    console.log("[EOLLUMANUAL-BE] Browser launched");

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
    );
    await page.goto(uri as string, { waitUntil: "networkidle0" });
    console.log("[EOLLUMANUAL-BE] Page loaded");

    // get frame
    const frame = await page.waitForFrame(async (frame) => {
      return frame.name() === "entryIframe";
    });
    console.log("[EOLLUMANUAL-BE] Frame loaded");

    // scroll some times to load all content
    await autoScroll(frame);
    console.log("[EOLLUMANUAL-BE] Scrolling done");

    const titleElem = await frame.waitForSelector(".GHAhO");
    const title = await titleElem?.evaluate((el) => el.textContent);
    const classificationElem = await frame.waitForSelector(".lnJFt");
    const classification = await classificationElem?.evaluate(
      (el) => el.textContent
    );
    const storeInfoElem = await frame.waitForSelector(".PIbes");
    const storeInfo = await storeInfoElem?.evaluate((el) => {
      return Array.from(el.children).map((child) => child.textContent);
    });
    const ret = {
      title,
      classification,
      storeInfo,
    };
    console.log("[EOLLUMANUAL-BE] Crawling done", ret);

    await page.close();
    await browser.close();
    res.status(200).json(ret);
  } catch (error: any) {
    console.error("[EOLLUMANUAL-BE] Error crawling", uri, error);
    if (browser) await browser.close();
    res.status(400).json({ message: "Error crawling", error: error.message });
  }
});

async function autoScroll(page: Frame | Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export default router;
