import { Client as TwilioChatClient } from "@twilio/conversations";

let twilioClientSingleton = null;

export const getTwilioClient = async (token) => {
  if (!twilioClientSingleton) {
    console.time("TwilioInit");
    twilioClientSingleton =  await new TwilioChatClient(token);
    console.timeEnd("TwilioInit");
  }
  return twilioClientSingleton;
};

export const waitForTwilioReady = (client, timeoutMs = 10000) =>
  new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error("Twilio client is null or undefined"));
      return;
    }

    // If already connected, resolve immediately
    if (client.connectionState === "connected") {
      resolve();
      return;
    }

    let timeoutId = null;
    let isResolved = false;

    // Handle connection state changes
    const handleStateChange = (state) => {
      if (isResolved) return; // Prevent multiple calls

      if (state === "connected") {
        isResolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        client.removeListener("connectionStateChanged", handleStateChange);
        resolve();
      } else if (state === "disconnected" || state === "denied") {
        isResolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        client.removeListener("connectionStateChanged", handleStateChange);
        reject(new Error(`Twilio connection failed with state: ${state}`));
      }
    };

    // Set up timeout to prevent infinite waiting
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        client.removeListener("connectionStateChanged", handleStateChange);
        reject(new Error(`Twilio connection timeout after ${timeoutMs}ms. Current state: ${client.connectionState}`));
      }
    }, timeoutMs);

    client.on("connectionStateChanged", handleStateChange);
  });
