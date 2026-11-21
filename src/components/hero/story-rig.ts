/**
 * The hero's animated state ("rig") and how it maps to SVG transforms.
 * Shared by the server-rendered scene (opening frame) and the timeline.
 */

import { layerTransform, type Camera, type Point, type Viewport } from "./geometry";
import { CLIENT_CURSOR, DEV_CURSOR, PAPER_STAGES } from "./scene-layout";

export type Layout = "wide" | "narrow";

/** Parallax depth of each layer: far moves less than the story, near more. */
export const LAYER_DEPTH = { far: 0.6, mid: 1, near: 1.35 } as const;

/** Mutable state the master timeline tweens; one render pass writes it to the DOM. */
export interface Rig {
  camera: Camera;
  paper: { x: number; y: number; rot: number; scale: number };
  client: Point;
  dev: Point;
  /** Motion-blur strength (feGaussianBlur stdDeviation along x). */
  blur: number;
  /** 0–1 progress of the ball along THROW_PATH; drives the ghost trail. */
  flight: number;
}

/** Opening shot per layout: the sheet on the desk, room for the title. */
export const INTRO_CAMERA: Record<Layout, Camera> = {
  wide: { x: 470, y: 470, zoom: 1, tilt: 0 },
  narrow: { x: 800, y: 760, zoom: 1, tilt: 0 },
};

/** World units visible across the screen at zoom 1. */
const FRAME_WIDTH: Record<Layout, number> = { wide: 1500, narrow: 760 };
const MIN_WIDE_HEIGHT = 800;

/** Initial rig: blank sheet on the desk, client cursor resting, owner off-screen. */
export function createRig(layout: Layout): Rig {
  const { x, y, rot } = PAPER_STAGES.desk;
  return {
    camera: { ...INTRO_CAMERA[layout] },
    paper: { x, y, rot, scale: 1 },
    client: { ...CLIENT_CURSOR.rest },
    dev: { ...DEV_CURSOR.enter },
    blur: 0,
    flight: 0,
  };
}

/**
 * The SVG viewBox size (world units at zoom 1) for a stage of `pixels` size.
 * Matches the stage aspect exactly so the scene never letterboxes.
 */
export function frameViewport(pixels: Viewport, layout: Layout): Viewport {
  const aspect = pixels.width > 0 && pixels.height > 0 ? pixels.width / pixels.height : 16 / 9;
  const width = FRAME_WIDTH[layout];
  const height = width / aspect;
  if (layout === "wide" && height < MIN_WIDE_HEIGHT) {
    return { width: MIN_WIDE_HEIGHT * aspect, height: MIN_WIDE_HEIGHT };
  }
  return { width, height };
}

const translate = (p: Point) => `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`;

/** SVG transform strings for every moving part of the rig. */
export function rigTransforms(rig: Rig, frame: Viewport) {
  return {
    far: layerTransform(rig.camera, LAYER_DEPTH.far, frame),
    mid: layerTransform(rig.camera, LAYER_DEPTH.mid, frame),
    near: layerTransform(rig.camera, LAYER_DEPTH.near, frame),
    paper: translate(rig.paper),
    paperInner: `rotate(${rig.paper.rot.toFixed(2)}) scale(${rig.paper.scale.toFixed(3)})`,
    client: translate(rig.client),
    dev: translate(rig.dev),
  };
}

/** viewBox attribute for a frame. */
export function frameViewBox(frame: Viewport): string {
  return `0 0 ${frame.width.toFixed(2)} ${frame.height.toFixed(2)}`;
}
