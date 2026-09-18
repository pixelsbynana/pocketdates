"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/types/domain";

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

interface GeolocationState {
  status: GeolocationStatus;
  coords: Coordinates | null;
  error: string | null;
}

/**
 * Location is only requested when the user explicitly asks for nearby
 * ideas — never on mount, never continuously tracked. Coordinates stay in
 * memory only; nothing is persisted unless the user saves a memory.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    coords: null,
    error: null,
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        status: "unavailable",
        coords: null,
        error: "Location isn't available in this browser.",
      });
      return;
    }

    setState((s) => ({ ...s, status: "loading", error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
        });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          coords: null,
          error:
            err.code === err.PERMISSION_DENIED
              ? "We couldn't access your location. You can still explore ideas to do at home."
              : "We couldn't find your location right now. You can still explore ideas to do at home.",
        });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  // If the browser already has geolocation permission granted from an
  // earlier visit, fetch coordinates right away — the browser won't show a
  // prompt in that case, so there's no reason to make the user click "Use
  // my location" again every time.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let cancelled = false;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (!cancelled && result.state === "granted") request();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [request]);

  return { ...state, request };
}
