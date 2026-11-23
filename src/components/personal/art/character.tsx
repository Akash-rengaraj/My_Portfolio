/**
 * The owner as an illustrated character, in profile facing right: warm
 * wheatish skin, straight black hair slicked back, a moustache, no beard and
 * no glasses. The head is drawn around (0, 0), about 110 units tall.
 */

export const SKIN = "#c68a5e";
export const SKIN_SHADE = "#a8714a";
export const HAIR = "#141015";
const LIP = "#7a4030";

const FACE =
  "M-12 38 C-34 30 -46 10 -44 -14 C-42 -46 -16 -64 12 -62 C32 -60 44 -46 44 -26 L45 -14 C49 -6 54 0 57 6 C58 9 56 12 52 12 L49 13 C50 17 51 21 49 24 C48 27 48 31 46 34 C44 41 38 46 30 48 C18 51 4 48 -12 38 Z";

/** Slicked-back hair hugging the skull from the hairline to the nape. */
const SLICKED =
  "M43 -34 C41 -54 22 -69 -2 -69 C-29 -69 -49 -48 -49 -20 C-49 -3 -45 11 -38 19 C-38 3 -34 -8 -28 -14 C-21 -21 -12 -24 -5 -28 C9 -35 26 -37 43 -34 Z";

const HELMET =
  "M-52 -4 C-57 -50 -22 -80 14 -78 C46 -76 64 -54 62 -26 L60 -18 L42 -18 C41 -31 30 -41 14 -41 L-8 -41 C-20 -37 -30 -21 -30 2 L-30 32 C-43 25 -51 11 -52 -4 Z";

/** The face, hair (or helmet) and features. `helmet` draws an adventure helmet with the visor up. */
export function Head({ helmet = false, flour = false }: { helmet?: boolean; flour?: boolean }) {
  return (
    <g>
      <path d="M-14 30 L14 30 L18 64 L-12 64 Z" fill={SKIN_SHADE} />
      <path d={FACE} fill={SKIN} />
      {/* cheek shading and jaw */}
      <path
        d="M-6 30 C8 42 24 44 36 40"
        stroke={SKIN_SHADE}
        strokeWidth="3"
        fill="none"
        opacity=".6"
      />
      <ellipse cx="-8" cy="4" rx="8" ry="11" fill={SKIN_SHADE} />
      {helmet ? null : (
        <>
          <path d={SLICKED} fill={HAIR} />
          <path d="M-3 -26 L5 -27 L3 0 L-3 -2 Z" fill={HAIR} />
          <path
            d="M32 -46 C14 -58 -16 -58 -36 -38"
            stroke="#ffffff"
            strokeOpacity=".16"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M26 -38 C8 -48 -18 -46 -34 -28"
            stroke="#ffffff"
            strokeOpacity=".1"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      <path
        d="M22 -22 Q31 -27 40 -23"
        stroke={HAIR}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="33" cy="-12" rx="3.2" ry="2.8" fill="#1b1310" />
      <path d="M31 19 C36 13 46 13 52 18 C47 23 37 23 31 19 Z" fill={HAIR} />
      <path
        d="M38 29 Q43 30 47 28"
        stroke={LIP}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {flour ? (
        <ellipse
          cx="18"
          cy="14"
          rx="9"
          ry="5"
          fill="#fff8ec"
          opacity=".85"
          transform="rotate(-15 18 14)"
        />
      ) : null}
      {helmet ? (
        <g>
          <path d={HELMET} fill="#17171c" />
          <path
            d="M-40 -30 C-30 -60 0 -72 30 -66"
            stroke="#ffffff"
            strokeOpacity=".22"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* peak */}
          <path d="M34 -72 L88 -58 L80 -48 L30 -60 Z" fill="#26262d" />
          {/* visor, flipped up */}
          <path
            d="M22 -58 C44 -60 64 -50 70 -34 L56 -38 C48 -46 36 -50 20 -50 Z"
            fill="#5d6a80"
            opacity=".75"
          />
          <path d="M-30 6 L-30 32" stroke="#ff6a1f" strokeWidth="3" />
        </g>
      ) : null}
    </g>
  );
}

/** A simple hand (a rounded mitten) at (0, 0), pointing right. */
export function Hand({ glove = false }: { glove?: boolean }) {
  return <ellipse cx="0" cy="0" rx="13" ry="10" fill={glove ? "#1f1f24" : SKIN} />;
}
