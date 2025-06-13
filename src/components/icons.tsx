import type { LucideProps } from 'lucide-react';

export const Logo = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="100" height="100" fill="#B0B8BF" stroke="none" />

    {/* Brown Bear (Top-Leftish Peeking) */}
    <g>
      {/* Peeking body/arm for brown bear */}
      <path d="M -5,55 C 5,65 15,60 5,75" stroke="#8B4513" strokeWidth="5" fill="none" />
      {/* Head */}
      <circle cx="20" cy="25" r="22" fill="#D2B48C" stroke="#8B4513" strokeWidth="2"/>
      {/* Ears */}
      <circle cx="8" cy="8" r="7" fill="#A0522D" stroke="#8B4513" strokeWidth="1.5"/>
      <circle cx="32" cy="8" r="7" fill="#A0522D" stroke="#8B4513" strokeWidth="1.5"/>
      {/* Eyes */}
      <circle cx="15" cy="22" r="2.5" fill="#2C1F17" stroke="none"/>
      <circle cx="25" cy="22" r="2.5" fill="#2C1F17" stroke="none"/>
      {/* Cheeks */}
      <ellipse cx="12" cy="30" rx="5" ry="3.5" fill="#FFDAB9" stroke="none"/>
      {/* Mouth (simple smile) */}
      <path d="M17 30 Q20 33 23 30" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
    </g>

    {/* White/Panda Bear (Bottom-Right Peeking) */}
    <g>
      {/* Peeking body/arm for white bear */}
      <path d="M 90,50 C 105,60 95,75 105,85" stroke="#404040" strokeWidth="5" fill="none" />
      {/* Head */}
      <circle cx="80" cy="75" r="22" fill="#FFFFFF" stroke="#202020" strokeWidth="2"/>
      {/* Ears */}
      <circle cx="68" cy="58" r="7" fill="#202020" stroke="none"/>
      <circle cx="92" cy="58" r="7" fill="#202020" stroke="none"/>
      {/* Eyes */}
      <circle cx="75" cy="72" r="2.5" fill="#000000" stroke="none"/>
      <circle cx="85" cy="72" r="2.5" fill="#000000" stroke="none"/>
      {/* Cheeks */}
      <ellipse cx="72" cy="80" rx="5" ry="3.5" fill="#FFC0CB" stroke="none"/>
      {/* Mouth (simple smile) */}
      <path d="M77 80 Q80 83 83 80" stroke="#000000" strokeWidth="1.5" fill="none"/>
    </g>
  </svg>
);
