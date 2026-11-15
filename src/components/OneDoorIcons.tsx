import type { SVGProps } from 'react';
import type { SupportCategoryId } from '../lib/types';

export function DoorwayLogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {/* Outer arch frame */}
      <path
        d="M6 28V14C6 8.477 10.477 4 16 4C21.523 4 26 8.477 26 14V28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Threshold line */}
      <path
        d="M4 28H28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Slightly open inner door */}
      <path
        d="M11 28V14.5C11 11.462 13.239 9 16 9V28"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Warm inner light */}
      <circle cx="19.5" cy="17.5" r="2.5" fill="#E9A23B" />
    </svg>
  );
}

export function HeroDoorwayIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 420 360"
      fill="none"
      role="img"
      aria-label="Illustration of an open arched doorway with warm interior light"
      {...props}
    >
      {/* Soft sage architectural backdrop */}
      <rect x="30" y="24" width="360" height="312" rx="180" fill="#DCE8E3" fillOpacity="0.65" />
      {/* Warm threshold light spill */}
      <path
        d="M168 296L114 336H306L252 296H168Z"
        fill="#E9A23B"
        fillOpacity="0.22"
      />
      {/* Main arched doorway frame */}
      <path
        d="M124 296V162C124 114.504 162.504 76 210 76C257.496 76 296 114.504 296 162V296"
        fill="#FAF6EF"
        stroke="#0F3D3E"
        strokeWidth="2.5"
      />
      {/* Inner warm glow */}
      <path
        d="M148 296V164C148 129.758 175.758 102 210 102C244.242 102 272 129.758 272 164V296H148Z"
        fill="#E9A23B"
        fillOpacity="0.16"
      />
      {/* Open door leaf */}
      <path
        d="M148 296V164C148 134 170 108 198 103V282L148 296Z"
        fill="#0F3D3E"
      />
      {/* Door handle */}
      <circle cx="187" cy="204" r="3.5" fill="#E9A23B" />
      {/* Guiding light ray / lantern */}
      <circle cx="233" cy="176" r="14" fill="#E9A23B" fillOpacity="0.88" />
      <circle cx="233" cy="176" r="24" stroke="#E9A23B" strokeWidth="1.5" strokeOpacity="0.45" />
      {/* Threshold step lines */}
      <path d="M96 296H324" stroke="#0F3D3E" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M116 312H304" stroke="#0F3D3E" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

export function CategoryOutlinedIcon({
  category,
  className = 'w-5 h-5',
}: {
  category: SupportCategoryId;
  className?: string;
}) {
  switch (category) {
    case 'medical_support':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'psychological_support':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 20.5C12 20.5 4.5 15.2 4.5 9.8C4.5 6.9 6.7 4.7 9.4 4.7C10.9 4.7 12 5.5 12 5.5C12 5.5 13.1 4.7 14.6 4.7C17.3 4.7 19.5 6.9 19.5 9.8C19.5 15.2 12 20.5 12 20.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'protection_safeguarding':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 3.5L19 6.5V11.8C19 16.2 16 19.7 12 21C8 19.7 5 16.2 5 11.8V6.5L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M9.5 12.2L11.2 13.9L14.8 10.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'legal_support':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 4V20M7 20H17M5 8H19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M6.5 8L4.5 13.5H8.5L6.5 8ZM17.5 8L15.5 13.5H19.5L17.5 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'sexual_violence_support':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M7 20V11C7 7.686 9.239 5 12 5C14.761 5 17 7.686 17 11V20"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path d="M4.5 20H19.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" fill="#E9A23B" />
        </svg>
      );
    case 'social_support':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M4 11L12 4.5L20 11V19.5H4V11Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M10 19.5V14H14V19.5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function PhoneOutlinedIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.5 4.5H9.8L11.3 8.2L9.4 9.7C10.5 11.9 12.1 13.5 14.3 14.6L15.8 12.7L19.5 14.2V17.5C19.5 18.6 18.6 19.5 17.5 19.5C10.9 19.1 4.9 13.1 4.5 6.5C4.5 5.4 5.4 4.5 6.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
