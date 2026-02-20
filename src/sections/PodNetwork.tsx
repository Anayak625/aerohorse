import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import { TextReveal, FadeIn } from '../components/TextReveal'

interface PodInfo {
  id: string
  name: string
  lat: number
  lng: number
  area: string
  temperature: string
  capacity: number
  maxCapacity: number
  nextPickup: string
  status: 'active' | 'busy' | 'maintenance'
  deliveriesToday: number
}

// Real coordinates for Goa pod locations
const pods: PodInfo[] = [
  {
    id: 'POD-001',
    name: 'Panaji Central',
    lat: 15.4989,
    lng: 73.8278,
    area: 'Panaji',
    temperature: '18°C',
    capacity: 12,
    maxCapacity: 20,
    nextPickup: '2 min',
    status: 'active',
    deliveriesToday: 47,
  },
  {
    id: 'POD-002',
    name: 'Miramar Beach',
    lat: 15.4722,
    lng: 73.8011,
    area: 'Miramar',
    temperature: '22°C',
    capacity: 8,
    maxCapacity: 15,
    nextPickup: '5 min',
    status: 'active',
    deliveriesToday: 31,
  },
  {
    id: 'POD-003',
    name: 'Mapusa Market',
    lat: 15.5912,
    lng: 73.8089,
    area: 'Mapusa',
    temperature: '19°C',
    capacity: 15,
    maxCapacity: 20,
    nextPickup: '1 min',
    status: 'busy',
    deliveriesToday: 63,
  },
  {
    id: 'POD-004',
    name: 'Calangute Strip',
    lat: 15.5439,
    lng: 73.7553,
    area: 'Calangute',
    temperature: '24°C',
    capacity: 5,
    maxCapacity: 15,
    nextPickup: '8 min',
    status: 'active',
    deliveriesToday: 28,
  },
  {
    id: 'POD-005',
    name: 'Vasco Hub',
    lat: 15.3839,
    lng: 73.8819,
    area: 'Vasco da Gama',
    temperature: '20°C',
    capacity: 18,
    maxCapacity: 25,
    nextPickup: '3 min',
    status: 'active',
    deliveriesToday: 52,
  },
  {
    id: 'POD-006',
    name: 'Margao South',
    lat: 15.273,
    lng: 73.9583,
    area: 'Margao',
    temperature: '21°C',
    capacity: 10,
    maxCapacity: 20,
    nextPickup: '4 min',
    status: 'active',
    deliveriesToday: 39,
  },
  {
    id: 'POD-007',
    name: 'Ponda Junction',
    lat: 15.4034,
    lng: 74.0151,
    area: 'Ponda',
    temperature: '19°C',
    capacity: 0,
    maxCapacity: 15,
    nextPickup: '—',
    status: 'maintenance',
    deliveriesToday: 0,
  },
  {
    id: 'POD-008',
    name: 'Old Goa Heritage',
    lat: 15.5034,
    lng: 73.9113,
    area: 'Old Goa',
    temperature: '20°C',
    capacity: 7,
    maxCapacity: 15,
    nextPickup: '6 min',
    status: 'active',
    deliveriesToday: 22,
  },
  {
    id: 'POD-009',
    name: 'Candolim North',
    lat: 15.5186,
    lng: 73.7624,
    area: 'Candolim',
    temperature: '23°C',
    capacity: 11,
    maxCapacity: 15,
    nextPickup: '2 min',
    status: 'busy',
    deliveriesToday: 55,
  },
  {
    id: 'POD-010',
    name: 'Colva Beach',
    lat: 15.2556,
    lng: 73.9211,
    area: 'Colva',
    temperature: '25°C',
    capacity: 9,
    maxCapacity: 15,
    nextPickup: '7 min',
    status: 'active',
    deliveriesToday: 18,
  },
]

const droneRoutes: { from: number; to: number }[] = [
  { from: 0, to: 1 },
  { from: 0, to: 7 },
  { from: 2, to: 3 },
  { from: 2, to: 8 },
  { from: 4, to: 5 },
  { from: 5, to: 9 },
  { from: 7, to: 6 },
  { from: 0, to: 4 },
]

const GOA_CENTER: [number, number] = [15.42, 73.92]
const DEFAULT_ZOOM = 10

function createPodIcon(status: PodInfo['status'], isActive: boolean) {
  const color =
    status === 'active' ? '#0d9488' : status === 'busy' ? '#f59e0b' : '#78716c'
  const size = isActive ? 16 : 12
  return L.divIcon({
    className: 'pod-marker-icon',
    html: `<span style="
      display:block;
      width:${size}px;
      height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function PodNetworkMap({
  pods,
  activePod,
  onPodClick,
  animate,
}: {
  pods: PodInfo[]
  activePod: PodInfo | null
  onPodClick: (pod: PodInfo) => void
  animate: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<L.LayerGroup | null>(null)
  const hasFittedBoundsRef = useRef(false)

  // Create map once when container is ready
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: GOA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    })
    L.control.zoom({ position: 'topright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layersRef.current = null
      hasFittedBoundsRef.current = false
    }
  }, [])

  // Update markers and polylines when pods or activePod change
  useEffect(() => {
    const map = mapRef.current
    if (!map || pods.length === 0) return
    if (layersRef.current) {
      map.removeLayer(layersRef.current)
    }
    if (!hasFittedBoundsRef.current) {
      const bounds = L.latLngBounds(pods.map((p) => [p.lat, p.lng] as L.LatLngTuple))
      map.fitBounds(bounds.pad(0.15))
      hasFittedBoundsRef.current = true
    }
    const group = L.layerGroup()
    layersRef.current = group

    // Polylines (drone routes)
    droneRoutes.forEach((r) => {
      const from = pods[r.from]
      const to = pods[r.to]
      if (!from || !to) return
      const line = L.polyline(
        [[from.lat, from.lng], [to.lat, to.lng]],
        { color: '#0d9488', weight: 2, opacity: 0.5, dashArray: '6, 6' }
      )
      group.addLayer(line)
    })

    // Markers
    pods.forEach((pod) => {
      const marker = L.marker([pod.lat, pod.lng], {
        icon: createPodIcon(pod.status, activePod?.id === pod.id),
      })
      const popupContent = `
        <div class="pod-popup">
          <p class="font-semibold text-stone-800">${pod.name}</p>
          <p class="text-xs text-stone-500">${pod.area}</p>
          <p class="mt-1 text-xs text-stone-400">${pod.capacity}/${pod.maxCapacity} · ${pod.status}</p>
          <a href="https://www.google.com/maps?q=${pod.lat},${pod.lng}" target="_blank" rel="noopener noreferrer" class="mt-2 inline-block text-xs text-teal-600 hover:underline">Open in Google Maps →</a>
        </div>
      `
      marker.bindPopup(popupContent)
      marker.on('click', () => onPodClick(pod))
      group.addLayer(marker)
    })

    map.addLayer(group)
    return () => {
      if (layersRef.current) map.removeLayer(layersRef.current)
      layersRef.current = null
    }
  }, [pods, activePod, onPodClick])

  return (
    <div
      className={`relative h-full w-full rounded-2xl overflow-hidden ${animate ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
    >
      <div ref={containerRef} className="h-full w-full pod-map-container" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] flex gap-4 rounded-xl border border-stone-200/80 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-sm">
        {[
          { label: 'Active', color: 'bg-[#0d9488]' },
          { label: 'Busy', color: 'bg-amber-400' },
          { label: 'Offline', color: 'bg-stone-400' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${item.color}`} />
            <span className="text-[10px] font-medium text-stone-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Open in Google Maps link */}
      <a
        href="https://www.google.com/maps/search/pods+goa/@15.42,73.92,10z"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/95 px-4 py-2.5 text-xs font-medium text-stone-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-stone-50 hover:text-teal-600"
      >
        <span>Open in Google Maps</span>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  )
}

export default function PodNetwork() {
  const [activePod, setActivePod] = useState<PodInfo | null>(null)
  const [sectionInView, setSectionInView] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSectionInView(true)
          setMapReady(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const totalDeliveries = pods.reduce((sum, p) => sum + p.deliveriesToday, 0)
  const activePods = pods.filter((p) => p.status !== 'maintenance').length
  const totalCapacity = pods.reduce((sum, p) => sum + p.capacity, 0)

  return (
    <section
      ref={sectionRef}
      id="pod-network"
      className="relative overflow-hidden bg-white py-32 md:py-48 lg:py-64"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-stone-50/50 via-transparent to-stone-50/50" />

      <div className="relative mx-auto px-8 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 md:mb-24 lg:mb-32">
          <FadeIn>
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
              Pod Network
            </p>
          </FadeIn>
          <h2 className="text-5xl font-bold tracking-tight text-stone-800 md:text-7xl lg:text-8xl">
            <TextReveal delay={0.1} stagger={0.04}>
              Live in Goa.
            </TextReveal>
            <TextReveal className="text-stone-400" delay={0.3} stagger={0.04}>
              Always on.
            </TextReveal>
          </h2>
          <FadeIn delay={0.5} className="mt-8 max-w-2xl">
            <p className="text-xl text-stone-500 leading-relaxed">
              10 smart pods across Goa&apos;s key corridors. Temperature-controlled,
              real-time monitored. Click a pod on the map or open in Google Maps.
            </p>
          </FadeIn>
        </div>

        {/* Network stats bar */}
        <FadeIn delay={0.6}>
          <div className="mb-12 flex flex-wrap gap-6 md:gap-10">
            {[
              { value: activePods.toString(), label: 'Active pods', color: 'text-teal-600' },
              { value: totalDeliveries.toString(), label: 'Deliveries today', color: 'text-stone-800' },
              { value: totalCapacity.toString(), label: 'Packages in pods', color: 'text-stone-800' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold tabular-nums md:text-4xl ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-sm text-stone-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Map + Detail layout — map and right panel share same row height for a clean grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12 lg:items-stretch">
          {/* Real map */}
          <FadeIn delay={0.7} className="h-full min-h-[320px] lg:min-h-[560px]">
            <div
              className="relative h-full aspect-[4/3] w-full overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 lg:aspect-auto"
              data-cursor-hover
            >
              {mapReady ? (
                <PodNetworkMap
                  pods={pods}
                  activePod={activePod}
                  onPodClick={setActivePod}
                  animate={sectionInView}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-400">
                  <p className="text-sm">Loading map…</p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Detail panel */}
          <div className="flex flex-col gap-4">
            {activePod ? (
              <PodDetail pod={activePod} onClose={() => setActivePod(null)} />
            ) : (
              <FadeIn delay={0.9}>
                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-stone-50/50 px-8 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-500">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-stone-700">Select a pod</p>
                  <p className="mt-2 max-w-[200px] text-sm text-stone-400">
                    Click any pod on the map to see live status, or open in Google Maps.
                  </p>
                </div>
              </FadeIn>
            )}

            {/* Pod list (compact) */}
            <FadeIn delay={1}>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                  All pods
                </p>
                <div className="pod-scroll max-h-[260px] space-y-1.5 overflow-y-auto">
                  {pods.map((pod) => (
                    <button
                      key={pod.id}
                      onClick={() => setActivePod(pod)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                        activePod?.id === pod.id
                          ? 'bg-teal-50 ring-1 ring-teal-200'
                          : 'hover:bg-stone-50'
                      }`}
                      data-cursor-hover
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          pod.status === 'active'
                            ? 'bg-green-400'
                            : pod.status === 'busy'
                              ? 'bg-amber-400'
                              : 'bg-stone-300'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-700">{pod.name}</p>
                      </div>
                      <span className="text-xs tabular-nums text-stone-400">
                        {pod.capacity}/{pod.maxCapacity}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

function PodDetail({ pod, onClose }: { pod: PodInfo; onClose: () => void }) {
  const capacityPercent = Math.round((pod.capacity / pod.maxCapacity) * 100)
  const mapsUrl = `https://www.google.com/maps?q=${pod.lat},${pod.lng}`

  return (
    <div className="animate-slideIn overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg shadow-stone-900/5">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-100">
              {pod.id}
            </p>
            <p className="mt-1 text-lg font-bold text-white">{pod.name}</p>
            <p className="mt-0.5 text-sm text-teal-100">{pod.area}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white/80 transition-colors hover:bg-white/30 hover:text-white"
            data-cursor-hover
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Open in Google Maps */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 border-b border-stone-100 bg-stone-50/50 px-4 py-3 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50"
        data-cursor-hover
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        View on Google Maps
      </a>

      {/* Status */}
      <div className="flex items-center gap-2 border-b border-stone-100 px-6 py-3">
        <div
          className={`h-2 w-2 rounded-full ${
            pod.status === 'active'
              ? 'bg-green-400'
              : pod.status === 'busy'
                ? 'bg-amber-400'
                : 'bg-stone-300'
          }`}
        />
        <span className="text-sm font-medium capitalize text-stone-600">{pod.status}</span>
        {pod.status !== 'maintenance' && (
          <span className="ml-auto text-xs text-stone-400">
            Next pickup in <span className="font-semibold text-stone-600">{pod.nextPickup}</span>
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-stone-100">
        <div className="bg-white px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Temperature</p>
          <p className="mt-1 text-xl font-bold text-stone-800">{pod.temperature}</p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Today</p>
          <p className="mt-1 text-xl font-bold text-stone-800">
            {pod.deliveriesToday}
            <span className="ml-1 text-xs font-normal text-stone-400">deliveries</span>
          </p>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Capacity</p>
          <p className="text-sm font-semibold tabular-nums text-stone-600">
            {pod.capacity}/{pod.maxCapacity}
          </p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              capacityPercent > 80
                ? 'bg-amber-400'
                : capacityPercent > 0
                  ? 'bg-teal-500'
                  : 'bg-stone-200'
            }`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-stone-400">
          {capacityPercent > 80 ? 'Near capacity' : capacityPercent > 0 ? 'Available' : 'Offline'}
        </p>
      </div>
    </div>
  )
}
