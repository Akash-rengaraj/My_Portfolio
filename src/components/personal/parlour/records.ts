/**
 * The records on the shelf: public-domain / CC0 recordings from Wikimedia
 * Commons, so they can play on the site legally. Audio files live in
 * `public/personal/music/<id>.mp3`.
 */

export type SleeveMotif = "sunburst" | "guitar" | "moon" | "stars" | "arcs";

export interface VinylRecord {
  id: string;
  title: string;
  composer: string;
  performer: string;
  /** Commons licence of the recording. */
  licence: "Public domain" | "CC0";
  sleeve: { paper: string; ink: string; motif: SleeveMotif };
  /** Colour of the record's centre label. */
  label: string;
}

export const RECORDS: readonly VinylRecord[] = [
  {
    id: "gymnopedie-guitar",
    title: "Gymnopédie No. 1, on guitar",
    composer: "Erik Satie",
    performer: "Michael Laucke, classical guitar",
    licence: "Public domain",
    sleeve: { paper: "#4f6b55", ink: "#efe6cf", motif: "guitar" },
    label: "#d9c27d",
  },
  {
    id: "gnossienne",
    title: "Gnossienne No. 1",
    composer: "Erik Satie",
    performer: "La Pianista, piano",
    licence: "Public domain",
    sleeve: { paper: "#2f3a5a", ink: "#e8c77a", motif: "moon" },
    label: "#e8c77a",
  },
  {
    id: "nocturne-55",
    title: "Nocturne, Op. 55 No. 1",
    composer: "Frédéric Chopin",
    performer: "Musopen, piano",
    licence: "CC0",
    sleeve: { paper: "#6e2a32", ink: "#f2dcc0", motif: "stars" },
    label: "#f2dcc0",
  },
];

/** Where a record's audio is served from. */
export const recordSrc = (record: VinylRecord) => `/personal/music/${record.id}.mp3`;
