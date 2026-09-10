import { getUADataPlatform } from '../utils/platform';
import { memoizeBoolean } from '../utils/cache';

// Smart TV platforms (Tizen, webOS, Android TV/Google TV, HbbTV hybrid
// broadcast TVs, Fire TV, Sony BRAVIA, VIDAA, etc). Best-effort like any
// UA-based check — some TV browsers ship a near-generic Android/Chrome UA
// with no reliable TV-specific token at all, so this can under-detect on
// those; it should never over-detect a phone/tablet/desktop as a TV.
export const detectIsTV = memoizeBoolean((): boolean => {
  if (typeof navigator === 'undefined') return false;

  const platform = getUADataPlatform();
  if (platform === 'tv') return true; // reserved value some Android TV builds report

  return /SmartTV|SMART-TV|Web0S|WebOS|HbbTV|GoogleTV|Android TV|AFT[A-Z]|BRAVIA|VIDAA|NetCast|CrKey/.test(
    navigator.userAgent
  );
});
