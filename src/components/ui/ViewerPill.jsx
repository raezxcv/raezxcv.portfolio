import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase.js';
import {
  ref,
  set,
  remove,
  onValue,
  onDisconnect,
  serverTimestamp,
  update,
  increment,
} from 'firebase/database';

// ─── Persistent visitor ID (one per browser, survives refreshes) ──────────────
function getVisitorId() {
  const KEY = 'vp_visitor_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

// ─── Device / browser string ───────────────────────────────────────────────────
function parseDevice() {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Unknown';
  if (/Edg\//.test(ua))                              browser = 'Edge';
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua))   browser = 'Safari';
  else if (/Firefox\//.test(ua))                     browser = 'Firefox';
  else if (/OPR\//.test(ua))                         browser = 'Opera';
  if (/Windows/.test(ua))                             os = 'Windows';
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) os = 'macOS';
  else if (/iPhone/.test(ua))                         os = 'iPhone';
  else if (/iPad/.test(ua))                           os = 'iPad';
  else if (/Android/.test(ua))                        os = 'Android';
  else if (/Linux/.test(ua))                          os = 'Linux';
  return `${browser} · ${os}`;
}

// ─── IP geolocation (no key, 10k/day free) ────────────────────────────────────
async function fetchGeo() {
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    return {
      city:        d.city        || 'Unknown',
      country:     d.country_name || 'Unknown',
      countryCode: d.country_code || '',
    };
  } catch {
    return { city: 'Unknown', country: 'Unknown', countryCode: '' };
  }
}

// ─── Avatar tones ─────────────────────────────────────────────────────────────
const TONES = [
  { bg: '#d4d4d4', color: '#3a3a3a' },
  { bg: '#c0c0c0', color: '#2a2a2a' },
  { bg: '#b0b0b0', color: '#222' },
  { bg: '#a0a0a0', color: '#1a1a1a' },
];

function cityInitial(city) {
  return city && city !== 'Unknown' ? city.charAt(0).toUpperCase() : '?';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ViewerPill() {
  const [viewers, setViewers]   = useState([]);
  const [ready,   setReady]     = useState(false);
  const [tooltip, setTooltip]   = useState(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const visitorId  = getVisitorId();
    const viewerRef  = ref(db, `portfolio/viewers/${visitorId}`); // keyed by visitorId → no duplicates
    const visitRef   = ref(db, `portfolio/visits/${visitorId}`);  // same key → upsert, not append
    const viewersRef = ref(db, 'portfolio/viewers');

    fetchGeo().then((geo) => {
      const device = parseDevice();
      const now    = new Date().toISOString();

      // ── Live presence (removed when ALL tabs close via onDisconnect) ──
      set(viewerRef, {
        joinedAt: serverTimestamp(),
        city:        geo.city,
        country:     geo.country,
        countryCode: geo.countryCode,
        device,
      }).then(() => {
        onDisconnect(viewerRef).remove();
      }).catch(() => {});

      // ── Permanent visit log — upsert by visitorId ──
      // First visit → creates record. Return visits → updates lastSeen + count only.
      update(visitRef, {
        city:        geo.city,
        country:     geo.country,
        countryCode: geo.countryCode,
        device,
        referrer:    document.referrer || 'direct',
        lastSeen:    now,
        visitCount:  increment(1),   // tracks how many times this person visited
      }).catch(() => {
        // Fallback: set full record if update fails (first write)
        set(visitRef, {
          city:        geo.city,
          country:     geo.country,
          countryCode: geo.countryCode,
          device,
          referrer:    document.referrer || 'direct',
          firstSeen:   now,
          lastSeen:    now,
          visitCount:  1,
        }).catch(() => {});
      });
    });

    // ── Real-time listener: unique viewers keyed by visitorId ──
    const unsub = onValue(
      viewersRef,
      (snapshot) => {
        const data = snapshot.val();
        const list = data
          ? Object.entries(data).map(([key, v]) => ({
              key,
              city:    v.city    || 'Unknown',
              country: v.country || 'Unknown',
              device:  v.device  || '',
            }))
          : [];
        setViewers(list);
        setReady(true);
      },
      () => setReady(false)
    );

    cleanupRef.current = () => {
      unsub();
      remove(viewerRef).catch(() => {});
    };

    return () => cleanupRef.current?.();
  }, []);

  if (!ready || viewers.length === 0) return null;

  const count = viewers.length;
  const shown = viewers.slice(0, 4);

  return (
    <div
      className="vp-pill"
      aria-label={`${count} ${count === 1 ? 'person' : 'people'} viewing now`}
    >
      {/* Stacked avatar initials */}
      <div className="vp-avatars">
        {shown.map((v, i) => {
          const tone = TONES[i % TONES.length];
          return (
            <div
              key={v.key}
              className="vp-avatar-wrap"
              style={{ zIndex: shown.length - i, marginLeft: i === 0 ? 0 : -8 }}
              onMouseEnter={() => setTooltip(v.key)}
              onMouseLeave={() => setTooltip(null)}
            >
              <span
                className="vp-avatar"
                style={{ background: tone.bg, color: tone.color }}
                aria-hidden="true"
              >
                {cityInitial(v.city)}
              </span>
              {tooltip === v.key && (
                <div className="vp-tooltip" role="tooltip">
                  <span className="vp-tt-loc">{v.city}, {v.country}</span>
                  {v.device && <span className="vp-tt-device">{v.device}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Label */}
      <span className="vp-label">
        <strong className="vp-count">{count}</strong>{' '}
        <span className="vp-text">{count === 1 ? 'person' : 'people'} viewing</span>
      </span>

      <style>{`
        .vp-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 5px 11px 5px 5px;
          border-radius: 999px;
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.09);
          width: fit-content;
          user-select: none;
        }
        .vp-avatars { display: flex; align-items: center; }
        .vp-avatar-wrap { position: relative; display: inline-flex; flex-shrink: 0; }
        .vp-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px; height: 24px;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          border: 2px solid #fff;
          flex-shrink: 0;
          cursor: default;
          font-family: 'Syne', sans-serif;
          transition: transform 0.15s ease;
        }
        .vp-avatar-wrap:hover .vp-avatar { transform: translateY(-2px); }
        .vp-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #111;
          border-radius: 7px;
          padding: 6px 10px;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          gap: 3px;
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 4px 16px rgba(0,0,0,0.22);
        }
        .vp-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #111;
        }
        .vp-tt-loc    { font-size: 11px; font-weight: 600; color: #fff; font-family: 'Syne', sans-serif; }
        .vp-tt-device { font-size: 10px; font-weight: 400; color: #9a9a9a; font-family: 'Syne', sans-serif; }
        .vp-label  { font-size: 11px; line-height: 1; white-space: nowrap; font-family: 'Syne', sans-serif; }
        .vp-count  { font-weight: 700; color: #111; }
        .vp-text   { font-weight: 400; color: #737373; }
      `}</style>
    </div>
  );
}
