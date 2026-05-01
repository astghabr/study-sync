import { Fragment, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Wifi, Plug, Coffee, Volume2, VolumeX, Users, X, Calendar, Map as MapIcon, List, Sparkles, Crown, TrendingUp, Star, Bookmark, BookmarkCheck, Camera, Send, Navigation, SlidersHorizontal, Clock as ClockIcon } from "lucide-react";
import { PermissionDialog } from "./PermissionDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { StatusBadge } from "./Badge";
import { AnimalAvatar } from "./Avatar";
import { SPOTS, type Spot, CURRENT_USER } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/subscriptionStore";
import { useSpotsExtra, spotsExtraStore, getSpotReviews, spotAverageRating } from "@/lib/spotsExtraStore";
import { UpgradeModal } from "./UpgradeModal";
import { AdSlot } from "./AdSlot";
import { useToast } from "@/hooks/use-toast";

const TYPE_FILTERS = ["All", "Cafe", "Library", "University Hub"] as const;

const AmenityIcon = ({ name }: { name: string }) => {
  const map: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-3.5 w-3.5" />,
    power: <Plug className="h-3.5 w-3.5" />,
    coffee: <Coffee className="h-3.5 w-3.5" />,
    quiet: <VolumeX className="h-3.5 w-3.5" />,
    food: <span className="text-xs">🍽</span>,
    groups: <Users className="h-3.5 w-3.5" />,
  };
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-foreground">
      {map[name] ?? "•"}
    </span>
  );
};

export function SpotsPage() {
  const { isPro } = useSubscription();
  const { favorites } = useSpotsExtra();
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>("All");
  const [laptopOnly, setLaptopOnly] = useState(false);
  const [quietOnly, setQuietOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [powerOnly, setPowerOnly] = useState(false);
  const [foodOnly, setFoodOnly] = useState(false);
  const [groupOnly, setGroupOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>();
  const [locationPermission, setLocationPermission] = useState<"pending" | "granted" | "denied">(
    () => (sessionStorage.getItem("ss-location-perm") as any) ?? "pending"
  );

  useEffect(() => {
    if (locationPermission !== "pending") {
      sessionStorage.setItem("ss-location-perm", locationPermission);
    }
  }, [locationPermission]);

  const activeFilterCount =
    (type !== "All" ? 1 : 0) +
    (laptopOnly ? 1 : 0) +
    (quietOnly ? 1 : 0) +
    (powerOnly ? 1 : 0) +
    (foodOnly ? 1 : 0) +
    (groupOnly ? 1 : 0) +
    (openNowOnly ? 1 : 0);

  const clearAllFilters = () => {
    setType("All");
    setLaptopOnly(false);
    setQuietOnly(false);
    setPowerOnly(false);
    setFoodOnly(false);
    setGroupOnly(false);
    setOpenNowOnly(false);
  };

  const filtered = useMemo(() => {
    return SPOTS.filter((s) => {
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (type !== "All" && s.type !== type) return false;
      if (laptopOnly && s.laptopPolicy !== "Allowed") return false;
      if (quietOnly && s.noise !== "Quiet") return false;
      if (powerOnly && !s.amenities.includes("power")) return false;
      if (foodOnly && !(s.amenities.includes("food") || s.amenities.includes("coffee"))) return false;
      if (groupOnly && !s.amenities.includes("groups")) return false;
      if (openNowOnly && s.status === "Closing soon") return false;
      if (savedOnly && !favorites.has(s.id)) return false;
      return true;
    });
  }, [query, type, laptopOnly, quietOnly, powerOnly, foodOnly, groupOnly, openNowOnly, savedOnly, favorites]);

  return (
    <div className="flex flex-col pb-6">
      <header className="px-6 pt-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Around you</p>
            <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight">Study spots</h1>
          </div>

          {/* List/Map toggle */}
          <div className="relative flex rounded-full border border-border bg-card p-1">
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="relative z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
              >
                {view === v && (
                  <motion.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-primary" />
                )}
                <span className={cn("relative z-10", view === v ? "text-primary-foreground" : "text-muted-foreground")}>
                  {v === "list" ? <List className="h-3.5 w-3.5" /> : <MapIcon className="h-3.5 w-3.5" />}
                </span>
                <span className={cn("relative z-10 capitalize", view === v ? "text-primary-foreground" : "text-muted-foreground")}>
                  {v}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a spot"
            className="h-11 rounded-xl bg-card pl-9 text-sm"
          />
        </div>
      </header>

      {/* Filter bar — opens the sticky filter sheet */}
      <div className="sticky top-0 z-20 mt-4 flex items-center gap-2 bg-background/95 px-6 pb-2 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <button
          onClick={() => setFiltersOpen(true)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
            activeFilterCount > 0
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setSavedOnly((v) => !v)}
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium",
            savedOnly ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
          )}
        >
          <Bookmark className={cn("h-3 w-3", savedOnly && "fill-current")} /> Saved ({favorites.size})
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="ml-auto shrink-0 text-[11px] font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="mt-4 flex flex-col gap-3 px-6"
          >
            {filtered.map((s, idx) => {
              const isFav = favorites.has(s.id);
              const avg = spotAverageRating(s.id);
              const reviewCount = getSpotReviews(s.id).length;
              return (
                <Fragment key={s.id}>
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition hover:shadow-card">
                    <button onClick={() => setSelected(s)} className="block w-full text-left">
                      <div className={`relative h-28 w-full bg-gradient-to-br ${s.hero}`}>
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          {s.official && <StatusBadge variant="official">Official Hub</StatusBadge>}
                          {s.laptopPolicy === "Not Allowed" && <StatusBadge variant="no-laptop">No laptops</StatusBadge>}
                          {s.noise === "Quiet" && <StatusBadge variant="quiet">Quiet zone</StatusBadge>}
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className={cn(
                            "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                            s.status === "Open" && "bg-success text-success-foreground",
                            s.status === "Busy" && "bg-warning text-warning-foreground",
                            s.status === "Closing soon" && "bg-foreground/80 text-background"
                          )}>
                            {s.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-display text-base font-semibold">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.type} · {s.distance} · {s.pricing}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-semibold text-foreground">{s.wifi}</span>
                            {avg != null && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-foreground">
                                <Star className="h-3 w-3 fill-accent text-accent" /> {avg.toFixed(1)}
                                <span className="text-muted-foreground">({reviewCount})</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                          {s.amenities.map((a) => (
                            <AmenityIcon key={a} name={a} />
                          ))}
                        </div>
                        {s.laptopNote && (
                          <p className="mt-3 text-[11px] font-medium text-foreground/70">📋 {s.laptopNote}</p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        spotsExtraStore.toggleFavorite(s.id);
                      }}
                      aria-label={isFav ? "Remove from saved" : "Save spot"}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition hover:scale-105"
                    >
                      {isFav ? (
                        <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {idx === 1 && <AdSlot variant="spots" />}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {savedOnly ? "No saved spots yet — tap the bookmark on a card to save it." : "No spots match these filters."}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25 }}
            className="mt-4 px-6"
          >
            <div className="relative h-[460px] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50 via-blue-50 to-amber-50 shadow-soft">
              {/* Decorative grid */}
              <svg className="absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.08" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              {/* Mock streets */}
              <div className="absolute left-0 right-0 top-1/3 h-[3px] bg-foreground/15" />
              <div className="absolute bottom-1/4 left-0 right-0 h-[3px] bg-foreground/10" />
              <div className="absolute bottom-0 left-1/2 top-0 w-[3px] bg-foreground/15" />

              {filtered.map((s, i) => {
                const positions = [
                  { top: "20%", left: "30%" },
                  { top: "35%", left: "70%" },
                  { top: "55%", left: "20%" },
                  { top: "60%", left: "65%" },
                  { top: "78%", left: "40%" },
                  { top: "25%", left: "55%" },
                ];
                const pos = positions[i % positions.length];
                return (
                  <motion.button
                    key={s.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", damping: 18 }}
                    onClick={() => setSelected(s)}
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={pos}
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated ring-4 ring-background">
                        <MapPin className="h-5 w-5 fill-accent text-accent" strokeWidth={2} />
                      </div>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-[10px] font-semibold shadow-soft">
                        {s.name}
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {/* You marker */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute -inset-3 animate-ping rounded-full bg-accent/40" />
                  <div className="relative h-4 w-4 rounded-full border-2 border-background bg-accent shadow-peach" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Tap a pin to view details</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spot detail modal */}
      <AnimatePresence>
        {selected && (
          <SpotDetail
            spot={selected}
            isPro={isPro}
            onClose={() => setSelected(null)}
            onUpgrade={(reason) => {
              setUpgradeReason(reason);
              setUpgradeOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        highlight={upgradeReason}
      />

      <PermissionDialog
        open={locationPermission === "pending"}
        icon={Navigation}
        title="Allow “StudySync” to use your location?"
        description="We use your location to show nearby study spots and accurate distances. You can change this anytime in settings."
        allowLabel="Allow"
        denyLabel="Don't allow"
        onAllow={() => setLocationPermission("granted")}
        onDeny={() => setLocationPermission("denied")}
      />
    </div>
  );
}

function SpotDetail({
  spot,
  isPro,
  onClose,
  onUpgrade,
}: {
  spot: Spot;
  isPro: boolean;
  onClose: () => void;
  onUpgrade: (reason: string) => void;
}) {
  const [reserved, setReserved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card shadow-elevated md:rounded-3xl"
      >
        <div className={`relative h-40 w-full bg-gradient-to-br ${spot.hero}`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur"
          >
            <X className="h-4 w-4" />
          </button>
          <FavoriteButton spotId={spot.id} />
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
            {spot.official && <StatusBadge variant="official">Official Hub</StatusBadge>}
            {spot.laptopPolicy === "Not Allowed" && <StatusBadge variant="no-laptop">No laptops</StatusBadge>}
            {spot.noise === "Quiet" && <StatusBadge variant="quiet">Quiet zone</StatusBadge>}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-semibold">{spot.name}</h2>
              <p className="text-sm text-muted-foreground">{spot.type} · {spot.distance} away · {spot.pricing}</p>
            </div>
            <span className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold",
              spot.status === "Open" && "bg-success/15 text-success",
              spot.status === "Busy" && "bg-warning/15 text-warning",
              spot.status === "Closing soon" && "bg-muted text-muted-foreground"
            )}>
              {spot.status}
            </span>
          </div>

          {/* Laptop policy callout */}
          <div className={cn(
            "mt-5 rounded-2xl border p-4",
            spot.laptopPolicy === "Allowed" && "border-success/20 bg-success/5",
            spot.laptopPolicy === "Restricted" && "border-warning/20 bg-warning/5",
            spot.laptopPolicy === "Not Allowed" && "border-destructive/20 bg-destructive/5"
          )}>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Laptop policy</p>
            <p className="mt-1 text-sm font-semibold">{spot.laptopPolicy}</p>
            {spot.laptopNote && <p className="mt-1 text-xs text-foreground/80">{spot.laptopNote}</p>}
          </div>

          {/* Vibes grid */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-background p-3">
              <Wifi className="h-4 w-4 text-foreground" />
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Wifi</p>
              <p className="text-sm font-semibold">{spot.wifi}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <Volume2 className="h-4 w-4 text-foreground" />
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Noise</p>
              <p className="text-sm font-semibold">{spot.noise}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <Plug className="h-4 w-4 text-foreground" />
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Outlets</p>
              <p className="text-sm font-semibold">{spot.amenities.includes("power") ? "Many" : "Few"}</p>
            </div>
          </div>

          {/* Student menu — Pro insight */}
          {spot.studentMenu && (
            <div className="relative mt-4 overflow-hidden rounded-2xl bg-accent-soft p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-primary/70">
                  Student menu
                </p>
                {!isPro && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                    <Crown className="h-2.5 w-2.5" /> PRO
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-1 font-display text-lg font-semibold text-primary",
                  !isPro && "blur-sm select-none"
                )}
              >
                {spot.studentMenu}
              </p>
              {!isPro && (
                <button
                  onClick={() => onUpgrade("Unlock student menu perks at every spot.")}
                  className="absolute inset-0 flex items-center justify-center bg-accent-soft/50 text-xs font-semibold text-primary"
                >
                  Tap to unlock with Pro
                </button>
              )}
            </div>
          )}

          {/* Pro spot insights */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Busy-time forecast
                </p>
              </div>
              {!isPro && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                  <Crown className="h-2.5 w-2.5" /> PRO
                </span>
              )}
            </div>
            {isPro ? (
              <div className="mt-3 flex items-end gap-1 h-12">
                {[30, 55, 80, 95, 70, 40, 25].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/70"
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            ) : (
              <button
                onClick={() => onUpgrade("See live busy-time forecasts for every spot.")}
                className="mt-2 w-full rounded-xl bg-accent-soft/40 py-3 text-xs font-semibold text-primary"
              >
                Unlock forecasts with Pro
              </button>
            )}
          </div>

          {/* Amenities full */}
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amenities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {spot.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                  <AmenityIcon name={a} /> {a}
                </span>
              ))}
            </div>
          </div>

          {/* Photos & reviews */}
          <ReviewsSection spotId={spot.id} spotHero={spot.hero} />

          {spot.reservationAvailable && (
            <Button
              onClick={() => {
                if (!isPro) {
                  onUpgrade("Reserving a spot 24h+ in advance is a Pro feature.");
                  return;
                }
                setReserved(true);
              }}
              disabled={reserved}
              className={cn("mt-6 h-12 w-full rounded-xl text-sm font-semibold", reserved && "bg-success hover:bg-success/90")}
            >
              {reserved ? (
                <><Sparkles className="mr-1 h-4 w-4" /> Table reserved</>
              ) : !isPro ? (
                <><Crown className="mr-1 h-4 w-4" /> Reserve with Pro</>
              ) : (
                <><Calendar className="mr-1 h-4 w-4" /> Book a table for group</>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FavoriteButton({ spotId }: { spotId: string }) {
  const { favorites } = useSpotsExtra();
  const isFav = favorites.has(spotId);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        spotsExtraStore.toggleFavorite(spotId);
      }}
      aria-label={isFav ? "Remove from saved" : "Save spot"}
      className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition hover:scale-105"
    >
      {isFav ? (
        <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </button>
  );
}

/** Mock photo strip — uses gradient swatches as faux photos. */
const PHOTO_GRADIENTS = [
  "from-amber-200 via-orange-200 to-rose-200",
  "from-slate-200 via-blue-200 to-indigo-200",
  "from-emerald-200 via-teal-200 to-cyan-200",
  "from-yellow-100 via-amber-200 to-orange-200",
];

function ReviewsSection({ spotId, spotHero }: { spotId: string; spotHero: string }) {
  // subscribe so new reviews re-render
  useSpotsExtra();
  const reviews = getSpotReviews(spotId);
  const avg = spotAverageRating(spotId);
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Photos
          </p>
        </div>
        <button className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
          <Camera className="h-3 w-3" /> Add photo
        </button>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <div className={cn("h-24 w-32 shrink-0 rounded-xl bg-gradient-to-br", spotHero)} />
        {PHOTO_GRADIENTS.map((g, i) => (
          <div key={i} className={cn("h-24 w-32 shrink-0 rounded-xl bg-gradient-to-br", g)} />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Student reviews
          </p>
          {avg != null ? (
            <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {avg.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground">
                · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">No reviews yet</p>
          )}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
        >
          Write a review
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {reviews.slice(0, 3).map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <AnimalAvatar animal={r.authorAnimal} size="sm" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{r.authorName}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < r.rating ? "fill-accent text-accent" : "text-border"
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {timeAgo(r.createdAt)}
              </p>
            </div>
            <p className="mt-2 text-sm leading-snug text-foreground">{r.text}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">
            Be the first to share what this spot is like.
          </p>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <ReviewModal spotId={spotId} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewModal({ spotId, onClose }: { spotId: string; onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const { toast } = useToast();
  const valid = rating >= 1 && text.trim().length >= 10 && text.length <= 400;

  const handleSubmit = () => {
    if (!valid) return;
    spotsExtraStore.addReview({
      spotId,
      authorName: CURRENT_USER.name.split(" ")[0] + " " + CURRENT_USER.name.split(" ")[1][0] + ".",
      authorAnimal: CURRENT_USER.animal,
      rating,
      text: text.trim(),
    });
    toast({ title: "Review posted", description: "Thanks for helping fellow students." });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-primary/50 backdrop-blur-sm md:items-center"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-display text-xl font-semibold">Write a review</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Help other students decide. Be specific & kind.
        </p>
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setRating(i + 1)}
                aria-label={`${i + 1} star${i ? "s" : ""}`}
                className="p-1"
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition",
                    i < rating ? "fill-accent text-accent" : "text-border"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your review</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 400))}
            placeholder="Wifi, vibe, seating, food — what should others know?"
            className="mt-2 min-h-[110px] rounded-2xl text-sm"
            maxLength={400}
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{text.trim().length < 10 ? "At least 10 characters" : "Looks good"}</span>
            <span>{text.length}/400</span>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!valid}
          className="mt-5 h-12 w-full rounded-xl text-sm font-semibold"
        >
          <Send className="mr-1 h-4 w-4" /> Post review
        </Button>
      </motion.div>
    </motion.div>
  );
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const day = 86400000;
  if (diff < day) return "today";
  if (diff < 2 * day) return "yesterday";
  const days = Math.floor(diff / day);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
