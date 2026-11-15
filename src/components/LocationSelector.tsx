import { useEffect, useRef, useState } from 'react';
import { Check, Edit3, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { TRANSLATIONS } from '../lib/i18n';
import type { GeocodedPlace, LanguageCode, UserLocation } from '../lib/types';

interface LocationSelectorProps {
  lang: LanguageCode;
  location: UserLocation | null;
  onChangeLocation: (next: UserLocation | null) => void;
}

export function LocationSelector({
  lang,
  location,
  onChangeLocation,
}: LocationSelectorProps) {
  const t = TRANSLATIONS[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noSearchResults, setNoSearchResults] = useState(false);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualCountry, setManualCountry] = useState(location?.country ?? '');
  const [manualCity, setManualCity] = useState(location?.city ?? '');
  const [manualRegion, setManualRegion] = useState(location?.region ?? '');
  const [manualPostal, setManualPostal] = useState(location?.postalCode ?? '');
  const [manualError, setManualError] = useState<string | null>(null);

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [pendingDetected, setPendingDetected] = useState<GeocodedPlace | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    setSearchError(null);
    setNoSearchResults(false);

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetch(`/api/location/search?q=${encodeURIComponent(trimmed)}`);
        const data = (await resp.json()) as { places?: GeocodedPlace[]; error?: string };
        if (!resp.ok) {
          setSuggestions([]);
          setSearchError(t.location.autocompleteError);
          setManualOpen(true);
          return;
        }
        const places = Array.isArray(data.places) ? data.places : [];
        setSuggestions(places);
        setNoSearchResults(places.length === 0);
      } catch {
        setSuggestions([]);
        setSearchError(t.location.autocompleteError);
        setManualOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, t.location.autocompleteError]);

  const applyPlace = (place: GeocodedPlace, source: UserLocation['source']) => {
    const next: UserLocation = {
      label: place.label,
      city: place.city,
      region: place.region,
      country: place.country,
      countryCode: place.countryCode,
      postalCode: place.postalCode,
      source,
    };
    onChangeLocation(next);
    setManualCountry(place.country);
    setManualCity(place.city);
    setManualRegion(place.region);
    setManualPostal(place.postalCode);
    setSuggestions([]);
    setSearchQuery('');
    setPendingDetected(null);
    setGpsError(null);
    setManualError(null);
    setStatusNotice(null);
    setManualOpen(false);
  };

  const handleConfirmManual = () => {
    const country = manualCountry.trim();
    const city = manualCity.trim();
    const region = manualRegion.trim();
    const postalCode = manualPostal.trim();

    if (!country && !city) {
      setManualError(t.location.manualValidationError);
      return;
    }

    const parts = Array.from(new Set([city, region, country].filter((p) => p.length > 0)));
    const label = parts.join(', ');

    onChangeLocation({
      label,
      city,
      region,
      country,
      countryCode: '',
      postalCode,
      source: 'manual',
    });
    setManualError(null);
    setPendingDetected(null);
    setGpsError(null);
    setStatusNotice(null);
    setManualOpen(false);
  };

  const handleRequestGps = () => {
    setGpsError(null);
    setStatusNotice(null);
    setPendingDetected(null);

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGpsError(t.location.errUnavailable);
      setManualOpen(true);
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resp = await fetch('/api/location/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lon: longitude }),
          });
          const data = (await resp.json()) as { place?: GeocodedPlace; code?: string };
          if (!resp.ok || !data.place) {
            if (resp.status === 422 || data.code === 'incomplete') {
              setGpsError(t.location.errIncomplete);
            } else {
              setGpsError(t.location.errReverseFailed);
            }
            setManualOpen(true);
            return;
          }
          setPendingDetected(data.place);
        } catch {
          setGpsError(t.location.errReverseFailed);
          setManualOpen(true);
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(t.location.errDenied);
        } else if (err.code === err.TIMEOUT) {
          setGpsError(t.location.errTimeout);
        } else {
          setGpsError(t.location.errPositionUnavailable);
        }
        setManualOpen(true);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    onChangeLocation(null);
    setPendingDetected(null);
    setSearchQuery('');
    setSuggestions([]);
    setManualCountry('');
    setManualCity('');
    setManualRegion('');
    setManualPostal('');
    setGpsError(null);
    setStatusNotice(t.location.preferNotToShare);
  };

  return (
    <div className="rounded-xl bg-[#FAF6EF]/80 border border-[#0F3D3E]/15 p-4 sm:p-5 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F3D3E]">
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t.location.sectionTitle}</span>
        </div>
        <p className="text-xs text-[#14202B]/75 leading-relaxed">{t.location.privacyWhy}</p>
      </div>

      {/* Confirmed location chip */}
      {location && (
        <div
          data-testid="confirmed-location-banner"
          className="rounded-xl bg-[#DCE8E3]/75 border border-[#0F3D3E]/25 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2"
        >
          <div className="text-xs sm:text-sm text-[#0F3D3E] min-w-0">
            <span className="font-medium">{t.location.confirmedLabel} </span>
            <strong className="font-semibold" data-testid="confirmed-location-label">
              {location.label}
              {location.postalCode ? ` (${location.postalCode})` : ''}
            </strong>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setManualCountry(location.country);
                setManualCity(location.city);
                setManualRegion(location.region);
                setManualPostal(location.postalCode);
                setManualOpen((prev) => !prev);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#0F3D3E]/25 bg-white text-xs font-medium text-[#0F3D3E] hover:bg-[#FAF6EF]"
            >
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.location.editButton}</span>
            </button>
            <button
              type="button"
              data-testid="clear-location-button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#0F3D3E]/20 bg-white text-xs font-medium text-[#14202B]/80 hover:text-[#B91C1C]"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.location.clearButton}</span>
            </button>
          </div>
        </div>
      )}

      {/* Pending geolocation confirmation card */}
      {pendingDetected && (
        <div
          data-testid="detected-location-card"
          role="status"
          className="rounded-xl bg-white border border-[#E9A23B] p-3.5 space-y-2.5"
        >
          <p className="text-xs font-semibold text-[#0F3D3E]">
            {t.location.detectedTitle}{' '}
            <span className="text-[#14202B] font-bold">
              {pendingDetected.label}
              {pendingDetected.postalCode ? ` (${pendingDetected.postalCode})` : ''}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="confirm-detected-location"
              onClick={() => applyPlace(pendingDetected, 'geolocation_confirmed')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F3D3E] text-[#FAF6EF] text-xs font-semibold hover:bg-[#0A2C2D]"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.location.confirmDetectedButton}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingDetected(null);
                setManualOpen(true);
              }}
              className="px-3 py-2 rounded-lg border border-[#0F3D3E]/25 text-xs font-medium text-[#0F3D3E] hover:bg-[#DCE8E3]/50"
            >
              {t.location.dismissDetectedButton}
            </button>
          </div>
        </div>
      )}

      {/* Search autocomplete + GPS trigger */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-7 space-y-1.5 relative">
          <label
            htmlFor="international-location-search"
            className="block text-xs font-semibold text-[#0F3D3E]"
          >
            {t.location.searchLabel}
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#0F3D3E]/60 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="international-location-search"
              data-testid="location-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.location.searchPlaceholder}
              className="w-full rounded-xl border border-[#0F3D3E]/25 bg-white ps-9 pe-3 py-2.5 text-sm text-[#14202B] min-h-[44px] focus:outline-2 focus:outline-[#0F3D3E]"
            />
          </div>

          {(isSearching || suggestions.length > 0 || noSearchResults || searchError) && (
            <div className="rounded-xl bg-white border border-[#0F3D3E]/20 shadow-sm overflow-hidden">
              {isSearching && (
                <p className="px-3.5 py-2.5 text-xs text-[#14202B]/70">{t.location.searching}</p>
              )}
              {!isSearching && searchError && (
                <p className="px-3.5 py-2.5 text-xs text-[#B91C1C]">{searchError}</p>
              )}
              {!isSearching && !searchError && noSearchResults && (
                <p className="px-3.5 py-2.5 text-xs text-[#14202B]/70">{t.location.noSuggestions}</p>
              )}
              {!isSearching && suggestions.length > 0 && (
                <ul role="listbox" className="divide-y divide-[#0F3D3E]/10 max-h-48 overflow-y-auto">
                  {suggestions.map((place) => (
                    <li key={place.id}>
                      <button
                        type="button"
                        data-testid={`location-suggestion-${place.id}`}
                        onClick={() => applyPlace(place, 'manual')}
                        className="w-full text-start px-3.5 py-2.5 text-xs sm:text-sm text-[#14202B] hover:bg-[#DCE8E3]/60 flex items-center justify-between gap-2"
                      >
                        <span className="truncate font-medium">{place.label}</span>
                        {place.postalCode && (
                          <span className="text-xs text-[#14202B]/65 font-mono-tabular shrink-0">
                            {place.postalCode}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-5 space-y-1">
          <button
            type="button"
            data-testid="use-current-location-btn"
            onClick={handleRequestGps}
            disabled={isDetectingGps}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#0F3D3E]/30 bg-white text-xs sm:text-sm font-semibold text-[#0F3D3E] hover:bg-[#DCE8E3]/60 disabled:opacity-60 min-h-[44px]"
          >
            <LocateFixed className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{isDetectingGps ? t.location.gpsDetecting : t.location.useGpsButton}</span>
          </button>
          <p className="text-[11px] text-[#14202B]/70 leading-snug">{t.location.gpsPrivacyNote}</p>
        </div>
      </div>

      {gpsError && (
        <div
          role="alert"
          data-testid="location-gps-error"
          className="rounded-xl bg-[#B91C1C]/8 border border-[#B91C1C]/30 px-3.5 py-2.5 text-xs text-[#B91C1C]"
        >
          {gpsError}
        </div>
      )}

      {statusNotice && !location && (
        <p className="text-xs text-[#0F3D3E]/85">{statusNotice}</p>
      )}

      {/* Expandable manual country/city/region/postal form */}
      <div className="pt-1 border-t border-[#0F3D3E]/10 space-y-3">
        <button
          type="button"
          data-testid="toggle-manual-location"
          onClick={() => setManualOpen((prev) => !prev)}
          className="text-xs font-semibold text-[#0F3D3E] underline underline-offset-4 hover:text-[#0A2C2D]"
        >
          {t.location.manualFieldsTitle}
        </button>

        {manualOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label htmlFor="manual-country" className="block text-xs font-medium text-[#0F3D3E]">
                {t.location.countryLabel}
              </label>
              <input
                id="manual-country"
                data-testid="manual-country-input"
                type="text"
                value={manualCountry}
                onChange={(e) => setManualCountry(e.target.value)}
                placeholder={t.location.countryPlaceholder}
                className="w-full rounded-xl border border-[#0F3D3E]/25 bg-white px-3 py-2 text-sm text-[#14202B] min-h-[42px]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="manual-city" className="block text-xs font-medium text-[#0F3D3E]">
                {t.location.cityLabel}
              </label>
              <input
                id="manual-city"
                data-testid="manual-city-input"
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                placeholder={t.location.cityPlaceholder}
                className="w-full rounded-xl border border-[#0F3D3E]/25 bg-white px-3 py-2 text-sm text-[#14202B] min-h-[42px]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="manual-region" className="block text-xs font-medium text-[#0F3D3E]">
                {t.location.regionLabel}
              </label>
              <input
                id="manual-region"
                type="text"
                value={manualRegion}
                onChange={(e) => setManualRegion(e.target.value)}
                placeholder={t.location.regionPlaceholder}
                className="w-full rounded-xl border border-[#0F3D3E]/25 bg-white px-3 py-2 text-sm text-[#14202B] min-h-[42px]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="manual-postal" className="block text-xs font-medium text-[#0F3D3E]">
                {t.location.postalLabel}
              </label>
              <input
                id="manual-postal"
                type="text"
                value={manualPostal}
                onChange={(e) => setManualPostal(e.target.value)}
                placeholder={t.location.postalPlaceholder}
                className="w-full rounded-xl border border-[#0F3D3E]/25 bg-white px-3 py-2 text-sm text-[#14202B] min-h-[42px]"
              />
            </div>

            {manualError && (
              <p role="alert" className="sm:col-span-2 text-xs text-[#B91C1C]">
                {manualError}
              </p>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                data-testid="confirm-manual-location-btn"
                onClick={handleConfirmManual}
                className="px-4 py-2 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] text-xs font-semibold hover:bg-[#0A2C2D] min-h-[40px]"
              >
                {t.location.confirmManualButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
