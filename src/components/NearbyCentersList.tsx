import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { NEARBY_TRANSLATIONS, TRANSLATIONS } from '../lib/i18n';
import type {
  EmergencyHotline,
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
      className="space-y-4"
    >
      {/* Transparency & Disclaimer Banner */}
      <div className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/18 p-3 flex items-start gap-2.5 text-xs text-[#14202B]">
        <Info className="w-4 h-4 text-[#0F3D3E] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-[#0F3D3E]">{n.temporaryBanner}</p>
          <p className="text-[#14202B]/75 leading-relaxed">{n.disclaimerNoReferral}</p>
        </div>
      </div>

      {/* Urgent Emergency & Crisis Helplines Section */}
      {result?.emergencyHotlines && result.emergencyHotlines.length > 0 && (
        <section
          data-testid="emergency-hotlines-banner"
          aria-label="Emergency and crisis helplines"
          className="rounded-2xl bg-[#FEF3C7]/80 border border-[#E9A23B]/50 p-4 space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#92400E]">
                {n.emergencySectionTitle}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#92400E]/90 leading-relaxed">
                {n.emergencySectionSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {result.emergencyHotlines.map((hotline: EmergencyHotline) => {
              const telClean = hotline.phone.replace(/[^+\d]/g, '');
              const telHref = telClean ? `tel:${telClean}` : null;

              return (
                <div
                  key={hotline.id}
                  data-testid="emergency-hotline-item"
                  className="rounded-xl bg-white border border-[#E9A23B]/30 p-3 flex flex-col justify-between gap-2 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#14202B] truncate">
                        {hotline.name}
                      </span>
                      {hotline.isUrgentEmergency && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#B45309] text-white shrink-0">
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#14202B]/75 leading-relaxed">
                      {hotline.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[#14202B]/60">
                      <span className="font-medium">{hotline.hoursLabel}</span>
                      {hotline.sourceNote && <span>· {hotline.sourceNote}</span>}
                      {hotline.lastVerifiedDate && (
                        <span>
                          · {n.lastVerifiedPrefix.replace('{date}', hotline.lastVerifiedDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-[#E9A23B]/20 flex items-center justify-between gap-2">
                    {telHref ? (
                      <a
                        href={telHref}
                        data-testid="emergency-call-btn"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B45309] text-white text-xs font-bold hover:bg-[#92400E] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Call {hotline.phone}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-[#14202B]/70 italic">Web service</span>
                    )}

                    {hotline.websiteUri && (
                      <a
                        href={hotline.websiteUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F3D3E] hover:underline"
                      >
                        <span>{n.officialWebsite}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                title={n.refreshNearbyBtn}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#0F3D3E]/20 bg-white text-xs font-medium text-[#0F3D3E] hover:bg-[#FAF6EF]"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{n.refreshNearbyBtn}</span>
              </button>
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
                      data-operating-status={center.operatingStatus}
                      className={`rounded-2xl p-4 border bg-white space-y-3 flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-[#0F3D3E] ring-1 ring-[#0F3D3E] shadow-sm'
                          : 'border-[#0F3D3E]/15 hover:border-[#0F3D3E]/30'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top Badges Row: Verification Tier + Real-Time Operating Status + Distance */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
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

                            {center.isEmergencyProvider && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] text-[11px] font-semibold">
                                <ShieldAlert className="w-3 h-3 shrink-0" aria-hidden="true" />
                                <span>Emergency care</span>
                              </span>
                            )}
                          </div>

                          <span
                            data-testid="nearby-center-distance"
                            className="text-xs font-mono-tabular font-semibold text-[#0F3D3E] shrink-0"
                          >
                            {center.distanceKm !== null
                              ? n.distanceAway.replace('{km}', String(center.distanceKm))
                              : n.distanceUnknown}
                          </span>
                        </div>

                        {/* Center Name & Support Pathway */}
                        <div>
                          <h4 className="font-display text-sm sm:text-base font-bold text-[#0F3D3E]">
                            {center.name}
                          </h4>
                          <p className="text-xs text-[#14202B]/75 capitalize">
                            {center.serviceTypeLabel}
                          </p>
                        </div>

                        {/* Matched Support Category Tags */}
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

                        {/* Phone Number (Clickable for Direct Call) */}
                        <div className="text-xs text-[#14202B]/85 space-y-1.5 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <Phone
                              className="w-3.5 h-3.5 text-[#0F3D3E] shrink-0"
                              aria-hidden="true"
                            />
                            {center.phone && telHref ? (
                              <a
                                href={telHref}
                                data-testid="center-phone-link"
                                className="font-semibold text-[#0F3D3E] underline underline-offset-2 hover:text-[#0A2C2D]"
                              >
                                {center.phone}
                              </a>
                            ) : (
                              <span className="text-[#14202B]/60 italic">
                                {n.noVerifiedPhone}
                              </span>
                            )}
                            {center.phone && (
                              <span className="text-[10px] text-[#14202B]/60">
                                {center.phoneVerified ? '(verified partner)' : '(public listing)'}
                              </span>
                            )}
                          </div>

                          {/* Operating Status (Clearly distinguishes confirmed open vs published hours vs unknown) */}
                          <div className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                            <Clock
                              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                center.operatingStatus === 'confirmed_open'
                                  ? 'text-emerald-700'
                                  : center.operatingStatus === 'published_hours_open'
                                    ? 'text-emerald-600'
                                    : center.operatingStatus === 'published_hours_closed'
                                      ? 'text-amber-700'
                                      : 'text-[#14202B]/60'
                              }`}
                              aria-hidden="true"
                            />
                            <div className="space-y-0.5">
                              <span
                                className={`font-semibold ${
                                  center.operatingStatus === 'confirmed_open'
                                    ? 'text-emerald-800'
                                    : center.operatingStatus === 'published_hours_open'
                                      ? 'text-emerald-700'
                                      : center.operatingStatus === 'published_hours_closed'
                                        ? 'text-amber-800'
                                        : 'text-[#14202B]/75'
                                }`}
                              >
                                {center.operatingStatusLabel}
                              </span>
                              {center.hoursDetail && (
                                <p className="text-[10px] text-[#14202B]/65 line-clamp-2">
                                  {center.hoursDetail}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Source and Verification Transparency */}
                          <div className="text-[10px] text-[#14202B]/60 flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                            {center.contactSource && (
                              <span>Source: {center.contactSource}</span>
                            )}
                            {center.lastVerifiedDate && (
                              <span>
                                · {n.lastVerifiedPrefix.replace('{date}', center.lastVerifiedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Clear Actions: Directions, Call, Official Website, Select for Summary */}
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
              className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/20 p-5 space-y-3 text-xs sm:text-sm"
            >
              <div className="space-y-1">
                <p className="font-display font-bold text-[#0F3D3E] text-sm sm:text-base">
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

              {result.expandedSearchSuggested && nextRadius && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onBroadenRadius(nextRadius)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] text-xs font-semibold hover:bg-[#0A2C2D]"
                  >
                    <Compass className="w-4 h-4" aria-hidden="true" />
                    <span>{n.broadenSearchBtn.replace('{km}', String(nextRadius))}</span>
                  </button>
                </div>
              )}
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
