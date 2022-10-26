import { translate } from "@translations";
import { padStart } from "lodash";

function secondsToHm(d: number): { h: number; m: number } {
  return {
    h: Math.floor(d / 3600),
    m: Math.floor((d % 3600) / 60),
  };
}

export function secondsToTimeAgo(d: number): string {
  const { h, m } = secondsToHm(d);
  let display = "";
  if (h > 0 && m >= 0) {
    display = translate("components/BatchHistory", "{{h}}h {{m}}m ago", {
      h,
      m,
    });
  } else {
    display = translate("components/BatchHistory", "{{m}}m ago", { m });
  }

  return display;
}

function secondsToDhm(s: number): {
  d: number;
  h: number;
  m: number;
  s: number;
} {
  return {
    d: Math.floor(s / (3600 * 24)),
    h: Math.floor((s % (3600 * 24)) / 3600),
    m: Math.floor(((s % (3600 * 24)) % 3600) / 60),
    s: s % 60,
  };
}

export function secondsToDhmsDisplay(seconds: number): string {
  const { d, h, m, s } = secondsToDhm(seconds);
  const dDisplay =
    d > 0 ? translate("components/BatchCard", " {{d}}d", { d }) : "";
  const hDisplay =
    h > 0
      ? translate("components/BatchCard", " {{h}}h", {
          h: d > 0 ? padStart(h.toString(), 2, "0") : h,
        })
      : "";
  const mDisplay =
    m > 0
      ? translate("components/BatchCard", " {{m}}m", {
          m: h > 0 ? padStart(m.toString(), 2, "0") : m,
        })
      : "";
  const sDisplay =
    s > 0
      ? translate("components/BatchCard", " {{s}}s", {
          s: padStart(s.toString(), 2, "0"),
        })
      : "";
  return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`;
}
