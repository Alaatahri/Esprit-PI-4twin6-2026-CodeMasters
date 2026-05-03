import { BmpMainContainer, BmpPageSurface } from "@/components/bmp/shell";

export default function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BmpPageSurface>
      <BmpMainContainer>{children}</BmpMainContainer>
    </BmpPageSurface>
  );
}
