import UnlistedDetail from "@/components/UnlistedDetail";

export default function UnlistedDetailPage({ params }: { params: { slug: string } }) {
  return <UnlistedDetail slug={params.slug} />;
}
