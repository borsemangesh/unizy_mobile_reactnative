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

    // Set up timeout to prevent infinite waiting
    const timeoutId = setTimeout(() => {
      client.removeListener("connectionStateChanged", handleStateChange);
      reject(new Error(`Twilio connection timeout after ${timeoutMs}ms. Current state: ${client.connectionState}`));
    }, timeoutMs);

    // Handle connection state changes
    const handleStateChange = (state) => {
      if (state === "connected") {
        clearTimeout(timeoutId);
        client.removeListener("connectionStateChanged", handleStateChange);
        resolve();
      } else if (state === "disconnected" || state === "denied") {
        clearTimeout(timeoutId);
        client.removeListener("connectionStateChanged", handleStateChange);
        reject(new Error(`Twilio connection failed with state: ${state}`));
      }
    };

    client.on("connectionStateChanged", handleStateChange);
  });
