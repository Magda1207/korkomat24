import { useEffect, useState } from "react";

export function useImageExists(url) {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!url) {
      setExists(false);
      return;
    }
    let canceled = false;
    const img = new window.Image();
    img.onload = () => !canceled && setExists(true);
    img.onerror = () => !canceled && setExists(false);
    img.src = url;
    return () => { canceled = true; };
  }, [url]);

  return exists;
}