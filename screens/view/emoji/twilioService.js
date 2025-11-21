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

export const waitForTwilioReady = (client) =>
  new Promise((resolve) => {
    if (client.connectionState === "connected") return resolve();
    client.on("connectionStateChanged", (state) => {
      if (state === "connected") resolve();
    });
  });
