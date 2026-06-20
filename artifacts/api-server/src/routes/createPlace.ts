import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod/v4";

const router: IRouter = Router();

const UNIVERSE_ID = "10269969012";
const TEMPLATE_PLACE_ID = "104802032762980";

const CreatePlaceBody = z.object({
  cx: z.number(),
  cz: z.number(),
});

router.post("/create-place", async (req: Request, res: Response) => {
  const apiKey = process.env.OPEN_CLOUD_API_KEY;
  const secret = process.env.ROBLOX_SECRET;

  if (!apiKey || !secret) {
    res.status(500).json({ error: "Server misconfigured: missing secrets" });
    return;
  }

  const auth = req.headers["authorization"];
  if (!auth || auth !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreatePlaceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }

  const { cx, cz } = parsed.data;
  const placeName = `Chunk_${cx}_${cz}`;

  const response = await fetch(
    `https://apis.roblox.com/cloud/v2/universes/${UNIVERSE_ID}/places`,
    {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: placeName,
        description: "",
        serverSize: 50,
        template: {
          placeId: TEMPLATE_PLACE_ID,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    req.log.error({ status: response.status, body: text }, "Roblox API error");
    res.status(502).json({ error: "Roblox API error", details: text });
    return;
  }

  const data = (await response.json()) as { id?: string; placeId?: string };
  const placeId = data.id ?? data.placeId;

  res.json({ placeId });
});

export default router;
