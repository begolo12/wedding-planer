import { redirect } from "next/navigation";

export default async function HalamanTautanPendek(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  redirect(`/bagikan/${token}`);
}
