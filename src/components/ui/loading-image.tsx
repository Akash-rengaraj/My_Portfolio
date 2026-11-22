"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * `next/image` that shows a shimmering skeleton in its own box until the image
 * has loaded (or failed), then fades the image in. Already-cached images still
 * report `onLoad` after hydration, so the skeleton never sticks.
 */
export function LoadingImage({ onLoad, onError, alt, ...props }: ImageProps) {
  const [loading, setLoading] = useState(true);

  return (
    <Image
      {...props}
      alt={alt}
      data-loading={loading}
      onLoad={(event) => {
        setLoading(false);
        onLoad?.(event);
      }}
      onError={(event) => {
        setLoading(false);
        onError?.(event);
      }}
    />
  );
}
