"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const { fyersModel } = require("fyers-api-v3");

const router = express.Router();
const fyers = new fyersModel();

router.get("/login", (req, res) => {
  const appId = process.env.FYERS_APP_ID;
  const redirectUrl = process.env.FYERS_REDIRECT_URL;

  if (!appId || !redirectUrl) {
    return res.status(500).json({ error: "Fyers App ID or Redirect URL is not configured." });
  }

  fyers.setAppId(appId);
  fyers.setRedirectUrl(redirectUrl);

  const authUrl = fyers.generateAuthCode();
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const authCode = req.query.auth_code;
  const appId = process.env.FYERS_APP_ID;
  const secretKey = process.env.FYERS_SECRET_KEY;

  if (!authCode) {
    return res.status(400).json({ error: "Missing auth_code in callback." });
  }

  if (!appId || !secretKey) {
    return res.status(500).json({ error: "Fyers App ID or Secret Key is not configured." });
  }

  fyers.setAppId(appId);

  try {
    const reqBody = {
      secret_key: secretKey,
      auth_code: authCode
    };

    const response = await fyers.generate_access_token(reqBody);

    if (response && response.s === "ok") {
      const tokenData = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        timestamp: new Date().toISOString()
      };

      const tokenFilePath = path.join(__dirname, "../../fyers_token.json");
      fs.writeFileSync(tokenFilePath, JSON.stringify(tokenData, null, 2), "utf8");

      res.status(200).json({ message: "Fyers authentication successful and token saved." });
    } else {
      res.status(400).json({ error: "Failed to generate access token", details: response });
    }
  } catch (error) {
    console.error("Fyers auth callback error:", error);
    res.status(500).json({ error: "Internal error during Fyers authentication callback." });
  }
});

module.exports = router;
