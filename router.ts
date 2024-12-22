import { Request, Response, Router } from "express";

const router = Router();

router.get("/crawl-naver-map", async (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Hello, world!" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
