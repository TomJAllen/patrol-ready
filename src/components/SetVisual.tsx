import type { VisualKey } from "@/content/sets";
import { WaveAnatomy, WaveTypeProfile } from "@/components/WaveDiagram";

// Draws a picture referenced from set content by key
export default function SetVisual({ name }: { name: VisualKey }) {
  switch (name) {
    case "wave-spilling":
      return <WaveTypeProfile type="spilling" />;
    case "wave-plunging":
      return <WaveTypeProfile type="plunging" />;
    case "wave-surging":
      return <WaveTypeProfile type="surging" />;
    case "wave-anatomy":
      return <WaveAnatomy />;
  }
}
