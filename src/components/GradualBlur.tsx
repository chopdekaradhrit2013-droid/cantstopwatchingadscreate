"use client";
import React, { useEffect, useRef, useState, useMemo, type CSSProperties } from "react";
import "./GradualBlur.css";

type Position = "top" | "bottom" | "left" | "right";
type Curve = "linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out";
type GradualBlurProps = {
  position?: Position; strength?: number; height?: string; width?: string; divCount?: number;
  exponential?: boolean; curve?: Curve; opacity?: number; animated?: boolean | "scroll";
  duration?: string; easing?: string; hoverIntensity?: number; target?: "parent" | "page";
  preset?: string; responsive?: boolean; zIndex?: number; onAnimationComplete?: () => void;
  className?: string; style?: CSSProperties;
};
const DEFAULT_CONFIG = {
  position: "bottom" as Position, strength: 2, height: "6rem", divCount: 5, exponential: false,
  zIndex: 1000, animated: false as boolean | "scroll", duration: "0.3s", easing: "ease-out",
  opacity: 1, curve: "linear" as Curve, responsive: false, target: "parent" as "parent" | "page",
  className: "", style: {} as CSSProperties,
};
const PRESETS: Record<string, Partial<GradualBlurProps>> = {
  top: { position: "top", height: "6rem" }, bottom: { position: "bottom", height: "6rem" },
  left: { position: "left", height: "6rem" }, right: { position: "right", height: "6rem" },
  subtle: { height: "4rem", strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: "10rem", strength: 4, divCount: 8, exponential: true },
  smooth: { height: "8rem", curve: "bezier", divCount: 10 },
  footer: { position: "bottom", height: "8rem", curve: "ease-out" },
  "page-footer": { position: "bottom", height: "10rem", target: "page", strength: 3 },
};
const CURVE_FUNCTIONS: Record<string, (p: number) => number> = {
  linear: (p) => p, bezier: (p) => p * p * (3 - 2 * p), "ease-in": (p) => p * p,
  "ease-out": (p) => 1 - Math.pow(1 - p, 2),
  "ease-in-out": (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
};
function mergeConfigs(...configs: object[]) {
  return configs.reduce((acc, c) => ({ ...acc, ...c }), {} as Record<string, unknown>);
}
function getGradientDirection(position: string) {
  return ({ top: "to top", bottom: "to bottom", left: "to left", right: "to right" } as Record<string, string>)[position] || "to bottom";
}
function GradualBlur(props: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const config = useMemo(() => {
    const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {};
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props) as typeof DEFAULT_CONFIG & GradualBlurProps;
  }, [props]);
  const isVisible = true;
  const blurDivs = useMemo(() => {
    const divs = [];
    const increment = 100 / config.divCount;
    const currentStrength = isHovered && config.hoverIntensity ? config.strength * config.hoverIntensity : config.strength;
    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear;
    for (let i = 1; i <= config.divCount; i++) {
      let progress = curveFunc(i / config.divCount);
      const blurValue = config.exponential
        ? Math.pow(2, progress * 4) * 0.0625 * currentStrength
        : 0.0625 * (progress * config.divCount + 1) * currentStrength;
      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;
      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;
      const direction = getGradientDirection(config.position);
      divs.push(
        <div key={i} style={{
          position: "absolute", inset: 0,
          maskImage: `linear-gradient(${direction}, ${gradient})`,
          WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
          backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
          WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
          opacity: config.opacity,
        }} />
      );
    }
    return divs;
  }, [config, isHovered]);
  const isPageTarget = config.target === "page";
  const containerStyle: CSSProperties = {
    position: isPageTarget ? "fixed" : "absolute",
    pointerEvents: config.hoverIntensity ? "auto" : "none",
    opacity: isVisible ? 1 : 0,
    zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
    height: config.height,
    width: "100%",
    left: 0,
    right: 0,
    [config.position]: 0,
    ...config.style,
  };
  return (
    <div ref={containerRef} className={`gradual-blur ${isPageTarget ? "gradual-blur-page" : "gradual-blur-parent"} ${config.className}`} style={containerStyle}
      onMouseEnter={config.hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={config.hoverIntensity ? () => setIsHovered(false) : undefined}>
      <div className="gradual-blur-inner" style={{ position: "relative", width: "100%", height: "100%" }}>{blurDivs}</div>
    </div>
  );
}
export default React.memo(GradualBlur);
