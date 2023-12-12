import { describe, expect, test } from "vitest";
import dotenv from 'dotenv'
import { inscribeAndSend, verifyMessage, transferBtc } from "../lib/claim";

dotenv.config()
describe(
  "claim",
  () => {
    test("verify message", () => {
      const pubkey =
        "03caafdac1fa341401b80977ef2de7c8e7730ba5d9ec650d2ab5717d758446f7a5";
      const message = `{op:depr} flut deployer verification`;
      const signature =
        "G2AuNdIpvVwToJ5L0f5GXPYvUWDaAqcuNmirMhtvuNpebtFvV4G49FJmfXyvGn14BOnYZIriVXyGIfDW8R8xHlY=";
      const result = verifyMessage({ message, pubkey, signature });
      expect(result).toBe(true);
    });
    test("test transaction", async () => {
      const hash = await transferBtc();
      console.log(hash);
      
    });
  },
  {
    timeout: 60000,
  }
);
