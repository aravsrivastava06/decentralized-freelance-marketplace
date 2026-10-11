import { useEffect, useState } from "react";
import { BidEvent, getBidPlacedEvents } from "@/services/blockchain";

export function useBidEvents(address: string | null) {
  const [events, setEvents] = useState<BidEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!address) {
      setEvents([]);
      return;
    }

    setLoading(true);
    getBidPlacedEvents(address)
      .then((nextEvents) => {
        if (active) setEvents(nextEvents);
      })
      .catch(() => {
        if (active) setEvents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [address]);

  return { events, loading };
}