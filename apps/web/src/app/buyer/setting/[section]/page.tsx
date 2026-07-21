import Link from "next/link";
import AppHeader from "@/components/AppHeader";

const TITLES: Record<string, string> = {
  profile: "Profile",
  clinic: "Clinic information & shipping address",
  tax: "Tax invoice details",
  docs: "FDA documents / licenses",
  payment: "Payment methods",
  notifications: "Notifications",
  security: "Security (password / 2FA)",
  history: "Transaction history",
};

export default function SettingSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const title = TITLES[params.section] ?? "Settings";
  return (
    <div>
      <AppHeader title={title} back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-10 text-center">
        <div className="text-5xl mb-3">🚧</div>
        <h2 className="font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">
          This page is under development — real data will be connected in a future phase.
        </p>
        <Link
          href="/buyer/setting"
          className="inline-block mt-6 text-mint font-semibold text-sm"
        >
          ‹ Back to Settings
        </Link>
      </main>
    </div>
  );
}
