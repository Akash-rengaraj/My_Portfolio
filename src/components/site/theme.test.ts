import { afterEach, describe, expect, it } from "vitest";

import {
  applyDevMode,
  applyTheme,
  DEV_STORAGE_KEY,
  readDevMode,
  readTheme,
  THEME_BOOT_SCRIPT,
  THEME_STORAGE_KEY,
} from "./theme";

afterEach(() => {
  document.documentElement.classList.remove("dark", "dev");
  localStorage.clear();
});

describe("theme", () => {
  it("defaults to dark before paint when nothing is saved", () => {
    new Function(THEME_BOOT_SCRIPT)();
    expect(readTheme()).toBe("dark");
  });

  it("restores a saved light theme before paint", () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    new Function(THEME_BOOT_SCRIPT)();
    expect(readTheme()).toBe("light");
  });

  it("switches to dark and back, remembering the choice", () => {
    applyTheme("dark");
    expect(readTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    applyTheme("light");
    expect(readTheme()).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("restores a saved dark theme before paint", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    new Function(THEME_BOOT_SCRIPT)();
    expect(readTheme()).toBe("dark");
  });

  it("turns Dev Mode on over dark, and off back to the saved theme", () => {
    applyTheme("light");
    applyDevMode(true);
    expect(readDevMode()).toBe(true);
    expect(readTheme()).toBe("dark");
    expect(localStorage.getItem(DEV_STORAGE_KEY)).toBe("on");
    applyDevMode(false);
    expect(readDevMode()).toBe(false);
    expect(readTheme()).toBe("light");
  });

  it("leaves Dev Mode when a normal theme is picked", () => {
    applyDevMode(true);
    applyTheme("dark");
    expect(readDevMode()).toBe(false);
    expect(readTheme()).toBe("dark");
  });
});
