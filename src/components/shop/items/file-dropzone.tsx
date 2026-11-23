"use client";

import { useId, useState, type DragEvent } from "react";

/** "1.4 MB"-style file sizes. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

/**
 * Drag-and-drop file upload with a click-to-browse fallback, a size limit and
 * a removable file list. It only collects files — pass `onFiles` to upload.
 */
export function FileDropzone({
  maxMb = 10,
  accept = "image/*,.pdf",
  onFiles,
}: {
  maxMb?: number;
  accept?: string;
  onFiles?: (files: File[]) => void;
}) {
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");

  const add = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = incoming.filter((f) => f.size > maxMb * 1024 * 1024);
    const ok = incoming.filter((f) => f.size <= maxMb * 1024 * 1024);
    setError(
      tooBig.length
        ? `${tooBig.map((f) => f.name).join(", ")} ${tooBig.length === 1 ? "is" : "are"} over ${maxMb} MB.`
        : "",
    );
    const next = [...files, ...ok];
    setFiles(next);
    onFiles?.(next);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    add(event.dataTransfer.files);
  };

  return (
    <div className="w-80">
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        data-over={over}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-6 py-8 text-center transition-colors focus-within:border-orange-500 hover:border-orange-400 data-[over=true]:border-orange-500 data-[over=true]:bg-orange-500/5 dark:border-zinc-700 dark:bg-zinc-950"
      >
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-full bg-orange-500/10 text-xl text-orange-600"
        >
          ↑
        </span>
        <span className="text-sm font-medium text-zinc-900 dark:text-white">
          Drop files here or{" "}
          <span className="text-orange-600 underline dark:text-orange-400">browse</span>
        </span>
        <span className="text-xs text-zinc-500">Images or PDF, up to {maxMb} MB</span>
        <input
          id={id}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(e) => add(e.target.files)}
        />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
      {files.length ? (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span aria-hidden="true">📄</span>
              <span className="flex-1 truncate text-zinc-800 dark:text-zinc-200">{file.name}</span>
              <span className="text-xs text-zinc-500">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => setFiles((all) => all.filter((_, j) => j !== i))}
                aria-label={`Remove ${file.name}`}
                className="text-zinc-400 hover:text-rose-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
