import { useLayoutEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const cache = new Map<string, Promise<unknown>>();

// Load public/<path> JSON (GeoJSON from the fetch scripts) and hold the render until it is there.
export const useJson = <T,>(path: string): T | null => {
  const [data, setData] = useState<T | null>(null);
  const [handle] = useState(() => delayRender(`json ${path}`));
  useLayoutEffect(() => {
    if (!cache.has(path)) cache.set(path, fetch(staticFile(path)).then((r) => r.json()));
    cache.get(path)!.then((d) => {
      setData(d as T);
      continueRender(handle);
    });
  }, [path, handle]);
  return data;
};
