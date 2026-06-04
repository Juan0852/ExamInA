import React from "react";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  gradient?: boolean;
}

export const FlameIcon = ({ size = 24, color = "#ef4444", gradient = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <LinearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fca5a5" />
          <Stop offset="1" stopColor="#dc2626" />
        </LinearGradient>
      </Defs>
    )}
    <Path
      d="M12 2C12 2 4 8.5 4 15C4 19.4183 7.58172 23 12 23C16.4183 23 20 19.4183 20 15C20 8.5 12 2 12 2Z"
      fill={gradient ? "url(#flameGrad)" : "none"}
      stroke={color}
      strokeWidth={gradient ? "0" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9C12 9 8.5 13 8.5 16.5C8.5 18.433 10.067 20 12 20C13.933 20 15.5 18.433 15.5 16.5C15.5 13 12 9 12 9Z"
      fill={gradient ? "#fef08a" : "none"}
      stroke={gradient ? "none" : color}
      strokeWidth={gradient ? "0" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LightningIcon = ({ size = 24, color = "#eab308", gradient = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <LinearGradient id="zapGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#fde047" />
          <Stop offset="1" stopColor="#ca8a04" />
        </LinearGradient>
      </Defs>
    )}
    <Path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      fill={gradient ? "url(#zapGrad)" : "none"}
      stroke={color}
      strokeWidth={gradient ? "0" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TrophyIcon = ({ size = 24, color = "#3b82f6", gradient = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <LinearGradient id="trophyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#93c5fd" />
          <Stop offset="1" stopColor="#2563eb" />
        </LinearGradient>
      </Defs>
    )}
    <Path
      d="M8 21H16M12 17V21M7 4H17C17 4 19 4 19 9C19 14 12 17 12 17C12 17 5 14 5 9C5 4 7 4 7 4Z"
      fill={gradient ? "url(#trophyGrad)" : "none"}
      stroke={color}
      strokeWidth={gradient ? "0" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 4C4 4 2 5 2 8C2 11 4 13 7 13M17 4C20 4 22 5 22 8C22 11 20 13 17 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookIcon = ({ size = 24, color = "#0ea5e9", gradient = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <LinearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#7dd3fc" />
          <Stop offset="1" stopColor="#0284c7" />
        </LinearGradient>
      </Defs>
    )}
    <Path
      d="M2 3H8C10.2091 3 12 4.79086 12 7V21C12 19.3431 10.2091 18 8 18H2V3Z"
      fill={gradient ? "url(#bookGrad)" : "none"}
      stroke={color}
      strokeWidth={gradient ? "0" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 3H16C13.7909 3 12 4.79086 12 7V21C12 19.3431 13.7909 18 16 18H22V3Z"
      fill={gradient ? "url(#bookGrad)" : "none"}
      stroke={color}
      strokeWidth={gradient ? "0" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TargetIcon = ({ size = 24, color = "#10b981", gradient = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <LinearGradient id="targetGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6ee7b7" />
          <Stop offset="1" stopColor="#059669" />
        </LinearGradient>
      </Defs>
    )}
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={gradient ? "0" : "2"} fill={gradient ? "url(#targetGrad)" : "none"} />
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={gradient ? "0" : "2"} fill={gradient ? "#fff" : "none"} />
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={gradient ? "0" : "2"} fill={gradient ? "url(#targetGrad)" : color} />
  </Svg>
);

export const ClockIcon = ({ size = 24, color = "#8b5cf6", gradient = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <LinearGradient id="clockGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#c4b5fd" />
          <Stop offset="1" stopColor="#6d28d9" />
        </LinearGradient>
      </Defs>
    )}
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={gradient ? "0" : "2"} fill={gradient ? "url(#clockGrad)" : "none"} />
    <Path d="M12 6V12L16 14" stroke={gradient ? "#fff" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const AwardIcon = ({ size = 24, color = "#f59e0b", gradient = false }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <LinearGradient id="awardGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#fcd34d" />
          <Stop offset="1" stopColor="#b45309" />
        </LinearGradient>
      </Defs>
    )}
    <Circle cx="12" cy="8" r="7" stroke={color} strokeWidth={gradient ? "0" : "2"} fill={gradient ? "url(#awardGrad)" : "none"} />
    <Path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={color} strokeWidth={gradient ? "0" : "2"} fill={gradient ? "url(#awardGrad)" : "none"} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
