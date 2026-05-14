import type { Metadata } from "next";
import { QAClient } from "./QAClient";

export const metadata: Metadata = {
  title: "Q&A",
  description:
    "Common questions about SecureCoding Training, the practice app for TDT4237 Software Security and Data Privacy.",
};

export default function QAPage() {
  return <QAClient />;
}
