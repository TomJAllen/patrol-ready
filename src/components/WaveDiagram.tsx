export type WaveTypeId = "spilling" | "plunging" | "surging";

// Simple line drawings for the Waves page. The shore is always on the right,
// so waves travel left to right.

const INK = "#1C1917";
const SEA = "#0E6A8C";
const SAND = "#F3E2BC";

function Arrowheads({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={INK} />
      </marker>
    </defs>
  );
}

// Crest, trough, wave height and wavelength
export function WaveAnatomy() {
  return (
    <svg
      viewBox="0 0 380 150"
      className="w-full h-auto"
      role="img"
      aria-label="A wave with the crest at the top, the trough at the bottom, wave height from trough to crest and wavelength from crest to crest"
    >
      <Arrowheads id="anat-arrow" />
      <path
        d="M0,105 C45,105 45,50 90,50 C135,50 135,105 180,105 C225,105 225,50 270,50 C315,50 315,105 360,105 L380,105 L380,150 L0,150 Z"
        fill={SEA}
        stroke={INK}
        strokeWidth="2.5"
      />
      {/* Wavelength: crest to crest */}
      <line x1="90" y1="50" x2="90" y2="22" stroke={INK} strokeDasharray="3 3" />
      <line x1="270" y1="50" x2="270" y2="22" stroke={INK} strokeDasharray="3 3" />
      <line x1="94" y1="26" x2="266" y2="26" stroke={INK} strokeWidth="1.5" markerStart="url(#anat-arrow)" markerEnd="url(#anat-arrow)" />
      <text x="180" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill={INK}>Wavelength</text>
      {/* Height: trough to crest */}
      <line x1="270" y1="50" x2="356" y2="50" stroke={INK} strokeDasharray="3 3" />
      <line x1="180" y1="105" x2="356" y2="105" stroke={INK} strokeDasharray="3 3" />
      <line x1="350" y1="54" x2="350" y2="101" stroke={INK} strokeWidth="1.5" markerStart="url(#anat-arrow)" markerEnd="url(#anat-arrow)" />
      <text x="0" y="0" transform="translate(368 78) rotate(-90)" textAnchor="middle" fontSize="12" fontWeight="700" fill={INK}>Height</text>
      {/* Labels */}
      <text x="90" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">Crest</text>
      <text x="180" y="128" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">Trough</text>
    </svg>
  );
}

function Spilling() {
  return (
    <>
      <path d="M0,64 C40,64 62,50 88,42 C102,38 112,42 122,52 C134,62 160,66 200,66 L200,110 L0,110 Z" fill={SEA} stroke={INK} strokeWidth="2" />
      {[
        [104, 41, 4],
        [112, 44, 4.5],
        [119, 49, 4],
        [126, 55, 3.5],
        [134, 60, 3],
        [143, 63, 2.5],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}`} cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth="1" />
      ))}
      <path d="M0,110 L0,102 L200,74 L200,110 Z" fill={SAND} stroke={INK} strokeWidth="2" />
    </>
  );
}

function Plunging() {
  return (
    <>
      <path
        d="M0,66 C40,66 66,58 80,40 C88,28 100,18 113,21 C126,24 133,40 125,54 C121,45 113,40 106,46 C100,53 101,66 118,68 C140,70 170,68 200,68 L200,110 L0,110 Z"
        fill={SEA}
        stroke={INK}
        strokeWidth="2"
      />
      <path d="M0,110 L0,100 L104,100 L118,80 L200,72 L200,110 Z" fill={SAND} stroke={INK} strokeWidth="2" />
    </>
  );
}

function Surging({ arrowId }: { arrowId: string }) {
  return (
    <>
      <path d="M0,64 C50,64 95,56 125,54 C148,53 165,48 186,42 L200,110 L0,110 Z" fill={SEA} stroke={INK} strokeWidth="2" />
      <path d="M0,110 L0,104 L120,100 L200,30 L200,110 Z" fill={SAND} stroke={INK} strokeWidth="2" />
      <line x1="146" y1="40" x2="178" y2="30" stroke={INK} strokeWidth="1.5" markerEnd={`url(#${arrowId})`} />
      <line x1="170" y1="40" x2="134" y2="49" stroke={INK} strokeWidth="1.5" markerEnd={`url(#${arrowId})`} />
    </>
  );
}

// Side view of how one type of wave breaks
export function WaveTypeProfile({ type }: { type: WaveTypeId }) {
  const arrowId = `wave-arrow-${type}`;
  return (
    <svg
      viewBox="0 0 200 110"
      className="w-full h-auto rounded-lg border-2 border-ink bg-sky-50"
      role="img"
      aria-label={`Side view of a ${type} wave, with the shore on the right`}
    >
      <Arrowheads id={arrowId} />
      {type === "spilling" && <Spilling />}
      {type === "plunging" && <Plunging />}
      {type === "surging" && <Surging arrowId={arrowId} />}
      <text x="196" y="14" textAnchor="end" fontSize="9" fontWeight="700" fill={INK}>Shore →</text>
    </svg>
  );
}
