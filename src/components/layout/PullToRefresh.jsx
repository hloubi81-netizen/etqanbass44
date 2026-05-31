import { useState, useRef, useCallback } from "react";
import { RotateCcw } from "lucide-react";

const THRESHOLD = 80;

export default function PullToRefresh({ children, onRefresh }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && containerRef.current?.scrollTop === 0) {
      setPullY(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      await onRefresh?.();
      setRefreshing(false);
    }
    setPullY(0);
    startY.current = null;
  }, [pullY, refreshing, onRefresh]);

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(pullY > 0 || refreshing) && (
        <div
          className="flex items-center justify-center text-primary transition-all"
          style={{ height: refreshing ? THRESHOLD : pullY, overflow: "hidden" }}
        >
          <RotateCcw
            className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: `rotate(${progress * 360}deg)`, opacity: progress }}
          />
        </div>
      )}
      <div style={{ transform: `translateY(${refreshing ? THRESHOLD : pullY}px)`, transition: pullY === 0 ? "transform 0.3s ease" : "none" }}>
        {children}
      </div>
    </div>
  );
}