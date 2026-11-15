import { useState } from 'react';
import { DoorwayLogoMark } from './OneDoorIcons';
import supportWelcomeImg from '../assets/images/support_journey_welcome_1794749424961.jpg';
import privacyHandsImg from '../assets/images/privacy_consent_hands_1794749425584.jpg';
import communityCircleImg from '../assets/images/community_care_circle_1794749426091.jpg';
import globalCompassImg from '../assets/images/global_compass_pathway_1794749425611.jpg';
import heroSupportPhoto from '../assets/images/hero_support_conversation_1794751496435.jpg';
import counselorListeningPhoto from '../assets/images/photo_counselor_listening_1794751497156.jpg';
import calmPortraitPhoto from '../assets/images/photo_everyday_calm_person_1794751497684.jpg';
import pathwayCareImg from '../assets/images/pathway_care_collage_1794751497466.jpg';
import intakeDeskImg from '../assets/images/intake_quiet_desk_1794751497442.jpg';

export type ArtworkId =
  | 'welcome'
  | 'privacy'
  | 'community'
  | 'global'
  | 'heroConversation'
  | 'counselorListening'
  | 'calmPortrait'
  | 'pathwayCare'
  | 'intakeDesk';

const ARTWORK_SRC: Record<ArtworkId, string> = {
  welcome: supportWelcomeImg,
  privacy: privacyHandsImg,
  community: communityCircleImg,
  global: globalCompassImg,
  heroConversation: heroSupportPhoto,
  counselorListening: counselorListeningPhoto,
  calmPortrait: calmPortraitPhoto,
  pathwayCare: pathwayCareImg,
  intakeDesk: intakeDeskImg,
};

interface GeneratedArtworkProps {
  id: ArtworkId;
  alt: string;
  className?: string;
  aspectClassName?: string;
  eager?: boolean;
}

export function GeneratedArtwork({
  id,
  alt,
  className = '',
  aspectClassName = 'aspect-[4/3]',
  eager = false,
}: GeneratedArtworkProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`w-full ${aspectClassName} rounded-2xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/15 flex items-center justify-center p-6 ${className}`}
      >
        <DoorwayLogoMark className="w-12 h-12 text-[#0F3D3E]/70" />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#0F3D3E]/12 bg-[#DCE8E3]/40 ${aspectClassName} ${className}`}
    >
      <img
        src={ARTWORK_SRC[id]}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
