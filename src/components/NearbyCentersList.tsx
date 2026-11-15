import {
  AlertCircle,
  Check,
  Compass,
  ExternalLink,
  Globe,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { NEARBY_TRANSLATIONS, TRANSLATIONS } from '../lib/i18n';
import type {
  LanguageCode,
  NearbySearchResponse,
  NearbySupportCenter,
} from '../lib/types';

interface NearbyCentersListProps {
  lang: LanguageCode;
  loading: boolean;
  error: string | null;
  result: NearbySearchResponse | null;
  radiusKm: 10 | 25 | 50;
  selectedCenterId: string;
  compact?: boolean;
  onSelectCenter: (center: NearbySupportCenter) => void;
  onBroadenRadius: (nextRadiusKm: 10 | 25 | 50) => void;
  onChangeLocation: () => void;
  onRefresh: () => void;
}

export function NearbyCentersList({
  lang,
  loading,
  error,
  result,
  radiusKm,
  selectedCenterId,
  compact = false,
  onSelectCenter,
  onBroadenRadius,
  onChangeLocation,
  onRefresh,
}: NearbyCentersListProps) {
  const t = TRANSLATIONS[lang];
  const n = NEARBY_TRANSLATIONS[lang];

  const nextRadius: 25 | 50 | null =
    radiusKm === 10 ? 25 : radiusKm === 25 ? 50 : null;

  return (
    <div
      data-testid={compact ? 'conv-nearby-centers-card' : 'step2-nearby-centers-card'}
      className="space-y-3"
    >
      {/* Temporary Hospital Alternative Note */}
      <div className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/18 p-3 flex items-start gap-2.5 text-xs text-[#14202B]">
        <Info className="w-4 h-4 text-[#0F3D3E] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">{n.temporaryBanner}</p>
      </div>

      {loading && (
        <div
          data-testid="nearby-centers-loading"
          className="rounded-xl bg-white border border-[#0F3D3E]/15 p-4 flex items-center gap-2.5 text-xs sm:text-sm text-[#0F3D3E]"
        >
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{n.searchingNearby}</span>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          data-testid="nearby-centers-error"
          className="rounded-xl bg-[#FEF3C7]/75 border border-[#E9A23B] p-3.5 text-xs text-[#14202B] space-y-2"
        >
          <p>{error || n.searchErrorBody}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F3D3E] text-[#FAF6EF] text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{n.refreshNearbyBtn}</span>
            </button>
            <button
              type="button"
              onClick={onChangeLocation}
              className="px-3 py-1.5 rounded-lg border border-[#0F3D3E]/25 bg-white text-xs font-semibold text-[#0F3D3E]"
            >
              {n.changeLocationBtn}
            </button>
          </div>
        </div>
      )}

      {!loading && !error && result && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h3 className="font-display text-sm sm:text-base font-bold text-[#0F3D3E]">
                {n.resultsTitle.replace('{location}', result.confirmedLocationLabel)}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#14202B]/75 leading-relaxed">
                {n.resultsSubtitle}
              </p>
            </div>
            <button
              type="button"
              data-testid="nearby-change-location-btn"
              onClick={onChangeLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F3D3E]/25 bg-white text-xs font-semibold text-[#0F3D3E] hover:bg-[#FAF6EF] shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{n.changeLocationBtn}</span>
            </button>
          </div>

          {result.centers.length > 0 ? (
            <div
              className={
                compact
                  ? 'space-y-3'
                  : 'grid grid-cols-1 md:grid-cols-2 gap-3.5'
              }
            >
              {(compact ? result.centers.slice(0, 6) : result.centers).map(
                (center) => {
                  const isSelected = selectedCenterId === center.id;
                  const telHref = center.phone
                    ? `tel:${center.phone.replace(/[^+\d]/g, '')}`
                    : null;

                  return (
                    <article
                      key={center.id}
                      data-testid="nearby-center-card"
                      data-verification={center.verificationTier}
                      className={`rounded-2xl p-4 border bg-white space-y-2.5 flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0F3D3E] ring-1 ring-[#0F3D3E]'
                          : 'border-[#0F3D3E]/15'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Verification Badge + Distance */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {center.verificationTier === 'verified_partner' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DCE8E3] text-[#0F3D3E] text-[11px] font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{n.badgeVerifiedPartner}</span>
                            </span>
                          ) : center.verificationTier === 'google_maps_directory' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF6EF] border border-[#0F3D3E]/18 text-[#0F3D3E] text-[11px] font-medium">
                              <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{n.badgePublicDirectory}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] text-[11px] font-medium">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{n.badgeIncomplete}</span>
                            </span>
                          )}

                          <span
                            data-testid="nearby-center-distance"
                            className="text-xs font-mono-tabular font-semibold text-[#0F3D3E]"
                          >
                            {center.distanceKm !== null
                              ? n.distanceAway.replace('{km}', String(center.distanceKm))
                              : n.distanceUnknown}
                          </span>
                        </div>

                        {/* Center Name & Type of Service */}
                        <div>
                          <h4 className="font-display text-sm sm:text-base font-bold text-[#0F3D3E]">
                            {center.name}
                          </h4>
                          <p className="text-xs text-[#14202B]/75 capitalize">
                            {center.serviceTypeLabel}
                          </p>
                        </div>

                        {/* Matched Support Need Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {center.matchedCategories.map((catId) => (
                            <span
                              key={catId}
                              className="px-2 py-0.5 rounded-md bg-[#DCE8E3]/60 text-[11px] font-medium text-[#0F3D3E]"
                            >
                              {t.categories[catId]?.label ?? catId}
                            </span>
                          ))}
                        </div>

                        {/* Address */}
                        {center.address && (
                          <p className="text-xs text-[#14202B]/85 leading-relaxed flex items-start gap-1.5">
                            <MapPin
                              className="w-3.5 h-3.5 text-[#0F3D3E] shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span>{center.address}</span>
                          </p>
                        )}

                        {/* Contact & Honest Opening Hours */}
                        <div className="text-xs text-[#14202B]/80 space-y-1 pt-0.5">
                          <p className="flex items-center gap-1.5">
                            <Phone
                              className="w-3.5 h-3.5 text-[#0F3D3E] shrink-0"
                              aria-hidden="true"
                            />
                            <span>
                              {center.phone ? center.phone : n.noVerifiedPhone}
                            </span>
                          </p>
                          <p className="text-[11px] text-[#14202B]/70">
                            {center.openNowVerified === true
                              ? n.hoursOpenVerified
                              : center.openNowVerified === false
                                ? n.hoursClosedVerified
                                : n.hoursUnverified}
                          </p>
                        </div>
                      </div>

                      {/* Clear Actions: Directions, Call, Website, Use in Summary */}
                      <div className="pt-2 border-t border-[#0F3D3E]/10 flex flex-wrap items-center gap-2">
                        <a
                          href={center.directionsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="nearby-directions-link"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F3D3E] text-[#FAF6EF] text-xs font-semibold hover:bg-[#0A2C2D] min-h-[34px]"
                        >
                          <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{n.directionsBtn}</span>
                          <ExternalLink className="w-3 h-3 opacity-80" aria-hidden="true" />
                        </a>

                        {telHref && (
                          <a
                            href={telHref}
                            data-testid="nearby-call-link"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F3D3E]/25 bg-[#FAF6EF] text-xs font-semibold text-[#0F3D3E] hover:bg-[#DCE8E3]/60 min-h-[34px]"
                          >
                            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{n.callBtn}</span>
                          </a>
                        )}

                        {center.websiteUri && (
                          <a
                            href={center.websiteUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="nearby-website-link"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F3D3E]/20 bg-white text-xs font-medium text-[#0F3D3E] hover:bg-[#FAF6EF] min-h-[34px]"
                          >
                            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{n.websiteBtn}</span>
                          </a>
                        )}

                        <button
                          type="button"
                          data-testid="nearby-select-summary-btn"
                          onClick={() => onSelectCenter(center)}
                          className={`ms-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[34px] ${
                            isSelected
                              ? 'bg-[#E9A23B] text-[#14202B]'
                              : 'bg-[#DCE8E3]/70 text-[#0F3D3E] hover:bg-[#DCE8E3]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                          <span>
                            {isSelected
                              ? n.selectedForSummaryBtn
                              : n.selectForSummaryBtn}
                          </span>
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div
              data-testid="nearby-centers-empty"
              className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/20 p-4 space-y-2 text-xs sm:text-sm"
            >
              <p className="font-display font-bold text-[#0F3D3E]">
                {result.mapsApiConfigured
                  ? n.emptyTitle
                      .replace('{km}', String(result.radiusKm))
                      .replace('{location}', result.confirmedLocationLabel)
                  : n.mapsNotConfiguredTitle}
              </p>
              <p className="text-[#14202B]/80 leading-relaxed">
                {result.mapsApiConfigured ? n.emptyBody : n.mapsNotConfiguredBody}
              </p>
            </div>
          )}

          {/* Broaden Radius / Change Location Footer Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {nextRadius && result.mapsApiConfigured && (
              <button
                type="button"
                data-testid="nearby-broaden-btn"
                onClick={() => onBroadenRadius(nextRadius)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#0F3D3E]/25 bg-white text-xs font-semibold text-[#0F3D3E] hover:bg-[#DCE8E3]/50 min-h-[38px]"
              >
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{n.broadenSearchBtn.replace('{km}', String(nextRadius))}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onChangeLocation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#0F3D3E]/20 bg-white text-xs font-medium text-[#14202B]/80 hover:text-[#0F3D3E] min-h-[38px]"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{n.changeLocationBtn}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
