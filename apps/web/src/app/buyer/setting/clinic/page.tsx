import { createClient } from "@/lib/supabase/server";
import ClinicAddress from "@/components/ClinicAddress";

export const dynamic = "force-dynamic";

export default async function ClinicPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: buyer } = user
    ? await supabase
        .from("buyer_profiles")
        .select("clinic_name, license_no")
        .eq("profile_id", user.id)
        .single()
    : { data: null };

  return (
    <ClinicAddress
      clinicName={buyer?.clinic_name ?? "—"}
      license={buyer?.license_no ?? "—"}
    />
  );
}
