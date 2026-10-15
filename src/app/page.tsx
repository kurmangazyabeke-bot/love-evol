import { BuilderLayout } from "@/components/layout/BuilderLayout";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { InviteMobilePreview } from "@/components/preview/InviteMobilePreview";

export default function Home() {
  return (
    <BuilderLayout previewNode={<InviteMobilePreview />}>
      <EditorPanel />
    </BuilderLayout>
  );
}
