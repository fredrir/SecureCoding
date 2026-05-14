import type { Metadata } from "next";
import { PrivacyClient } from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for SecureCoding Training. No personal data is collected.",
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
