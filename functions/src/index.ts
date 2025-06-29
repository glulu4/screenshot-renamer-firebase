/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import OpenAI from "openai";
import "dotenv/config";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import db from "./converter";
import {maxQuotaPerTier, Tier, UserDevice} from "./types";

const MAX_FREE_QUOTA = 25;

const normalize = (ts: any) =>
  (ts && ts.toDate) ? ts.toDate().toISOString() : null;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stripe = require('stripe')(process.env.STRIPE_PUBLISHABLE_KEY);



export const onSubscriptionDelete = onRequest({invoker: "public"}, async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.ON_SUBSCRIPTION_DELETE_WHSEC;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    logger.error("❌ Webhook signature verification failed:", err);
    res.status(400).send(`Webhook Error: ${err}`);
    return;
  }

  if (event.type !== "customer.subscription.deleted") {
    logger.info("ℹ️ Ignored event type:", event.type);
    res.status(200).send("Event ignored");
    return;
  }

  const subscription = event.data.object;
  const customerId = subscription.customer;

  if (!customerId) {
    logger.error("❌ No Stripe customer ID found in subscription.deleted event");
    res.status(400).send("Missing Stripe customer ID");
    return;
  }

  // Find user by Stripe customer ID
  const userRef = db.users.where("stripeCustomerId", "==", customerId);
  const userSnap = await userRef.get();

  if (userSnap.empty) {
    logger.error("❌ No user found with Stripe customerId:", customerId);
    res.status(404).send("User not found");
    return;
  }

  const userDoc = userSnap.docs[0];

  await userDoc.ref.update({
    tier: Tier.FREE,
    maxQuota: maxQuotaPerTier[Tier.FREE],
    subscriptionStatus: "canceled",
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    subscribedAt: null,
    updatedAt: new Date(),
  });

  logger.info("✅ Subscription canceled and user downgraded to FREE:", userDoc.id);
  res.status(200).send("User downgraded after subscription cancellation");
});

export const onUpdate = onRequest(
  {invoker: "public"},
  async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_PUBLISHABLE_KEY);
    const endpointSecret = process.env.ON_UPDATE_WHSEC;
    const sig = req.headers["stripe-signature"] as string;

    logger.info("Received webhook event with signature:", sig);

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      logger.error("Webhook signature verification failed:", err);
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    logger.info("Webhook event received:", event.type);

    if (event.type !== "customer.subscription.updated") {
      logger.info("Ignoring event type:", event.type);
      res.status(200).send("Event type not handled");
      return;
    }

    const sub = event.data.object;
    const customerId = sub.customer;

    logger.info("Updating subscription for customer:", customerId);

    const userRef = db.users.where("stripeCustomerId", "==", customerId);
    const userSnap = await userRef.get();

    if (userSnap.empty) {
      logger.error("No user found for Stripe customerId:", customerId);
      res.status(404).send("User not found");
      return;
    }


    logger.info("cancel_at_period_end:", sub.cancel_at_period_end);
    logger.info("current_period_end:", sub.current_period_end);
    const currentPeriodEndSeconds =
      sub.current_period_end || sub.items?.data?.[0]?.current_period_end;

    const currentPeriodEnd = currentPeriodEndSeconds
      ? new Date(currentPeriodEndSeconds * 1000)
      : null;
  

    const userDoc = userSnap.docs[0];

    await userDoc.ref.update({
      // tier: Tier.PRO, // still PRO until fully canceled
      updatedAt: new Date(),
      stripeCustomerId: customerId,
      cancelAtPeriodEnd: sub.cancel_at_period_end || false,
      currentPeriodEnd: currentPeriodEnd,
      subscriptionStatus: sub.status,
    });

    logger.info(`User subscription updated (cancel at end: ${sub.cancel_at_period_end})`);
    res.status(200).send("Subscription updated in Firestore");

  });


export const register = onRequest(async (req, res) => {
  const {deviceId, system, appVersion} = req.body;

  if (!deviceId || !system) {
    logger.error("Missing deviceId or system");
    res.status(400).json({success: false, error: "Missing fields"});
    return;
  }

  logger.info("Registering deviceId:", deviceId);

  const userRef = db.users.doc(deviceId);
  const userSnap = await userRef.get();

  // creating user
  if (!userSnap.exists) {
    const userDevice: UserDevice = {
      deviceId,
      system,
      appVersion: appVersion || "unknown",
      quotaUsed: 0, // Optional: set initial quota
      maxQuota: maxQuotaPerTier[Tier.FREE], // Optional: set initial max quota based on tier

      createdAt: new Date(),
      tier: Tier.FREE,
      email: null, // Optional: set initial email
      stripeCustomerId: null, // Optional: set initial Stripe customer ID
    };

    await userRef.set(userDevice);
    logger.info("✅ New user registered:", deviceId);
  } else {
    logger.info("ℹ️ Existing user:", deviceId);
  }

  const userData: UserDevice | undefined = (await userRef.get()).data();

  if (!userData) {
    logger.error("User data not found for deviceId:", deviceId);
    res.status(404).json({success: false, error: "User not found"});
    return;
  }

  // Normalize the user data
  userData.createdAt = normalize(userData.createdAt);
  userData.updatedAt = normalize(userData.updatedAt);
  userData.subscribedAt = normalize(userData.subscribedAt);
  userData.currentPeriodEnd = normalize(userData.currentPeriodEnd);

  res.status(201).json({
    success: true,
    message: "User registered",
    data: {
      userDevice: userData,
    },
  });
});

export const onSubscibe = onRequest(async (req, res) => {

  const endpointSecret = process.env.ON_SUBSCRIBE_WHSEC
  const sig = req.headers["stripe-signature"] as string;

  logger.info("Received webhook event with signature:", sig);


  let event;

  try {
    // stripe needs string, and firebase parses body by default, so we give it the raw body
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err}`);
    return;
  }

  logger.info("Webhook event received:", event.type);
  if (event.type !== "checkout.session.completed") {
    logger.info("Ignoring event type:", event.type);
    res.status(200).send("Event type not handled");
    return;
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const deviceId = session.client_reference_id;
    const email = session.customer_details?.email;
    const customerId = session.customer;

    logger.info("Checkout session completed for deviceId:", deviceId);
    logger.info("Session details:", session);



    if (deviceId) {
      await db.users.doc(deviceId).update({
        tier: Tier.PRO,
        maxQuota: maxQuotaPerTier["pro"],
        subscribedAt: new Date(),
        quotaUsed: 0, // Reset quota used on event of payment
        updatedAt: new Date(),
        email: email || null,
        stripeCustomerId: customerId || null,
        subscriptionStatus: "active",
      });
    }
  }


  res.status(200).send("Webhook received and processed successfully");
});


export const generateScreenshotName = onRequest(
  {
    memory: "512MiB", // or "1GiB"
    timeoutSeconds: 60 // optional, for safety
  },
  async (req, res) => {
    const {base64Img, deviceId, appVersion} = req.body;
    logger.info("base64Img: ", base64Img);
    logger.info("deviceId: ", deviceId);
    logger.info("appVersion: ", appVersion);

    if (!base64Img || !deviceId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing image or deviceId');
    }

    const userRef = db.users.doc(deviceId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      logger.error("User not found for deviceId:", deviceId);
      res.status(404).json({success: false, error: "User not found"});
      return;
    }
    const userData: UserDevice | undefined = userSnap.data();

    if (!userData) {
      logger.error("User data not found for deviceId:", deviceId);
      res.status(404).json({success: false, error: "User not found"});
      return;
    }

    // only limiting free tier users
    if (userData.tier === Tier.FREE && userData.quotaUsed >= MAX_FREE_QUOTA) {
      logger.error("Free tier quota exceeded for deviceId:", deviceId);
      res.status(429).json({success: false, message: "Free tier quota exceeded"});
      return;
    }



    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "Return a short and descriptive filename for this screenshot, lowercase with no spaces or extension."
            },
            {
              "type": "image_url",
              "image_url": {"url": base64Img}
            },
          ]
        }
      ],
      response_format: {
        "type": "text"
      },
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    logger.info("response: ", response);
    const content: string = response.choices[0]?.message?.content || "screenshot";


    await userRef.update({
      quotaUsed: (userData.quotaUsed || 0) + 1,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Successfully generated screenshot name",
      data: {
        screenshotName: content,
      }
    });


  })
