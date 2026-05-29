/**
 * Single source of truth for site-wide content and metrics.
 * Keep all headline numbers here so they never drift across pages.
 */

export const stats = {
  arrivalTime: '< 70s',
  arrivalTimeLong: 'under 70 seconds',
  callsCleared: '1 in 3',
  callsClearedPct: '33%',
  fasterResponse: '54%',
  agencies: '40+',
  states: '22',
  flightTime: '45 min',
  topSpeed: '55 mph',
  thermal: '640p',
  visualZoom: '640×',
  coverage: '24/7/365',
} as const;

export const heroStats = [
  { value: stats.arrivalTime, label: 'Avg. scene arrival', accent: 'gold' as const },
  { value: stats.callsCleared, label: 'Calls cleared solo', accent: 'rose' as const },
  { value: stats.fasterResponse, label: 'Faster response', accent: 'indigo' as const },
];

export const contact = {
  email: 'contact@aerohorse.io',
  sales: 'sales@aerohorse.io',
  support: 'support@aerohorse.io',
  phone: '+1 (800) 273-7626',
  location: 'Seattle, WA · Made in USA',
  address: ['123 Aviation Blvd.', 'Seattle, WA 98108', 'United States'],
} as const;

export const pressOutlets = [
  'REUTERS', 'BLOOMBERG', 'WSJ', 'THE NEW YORK TIMES', 'TECHCRUNCH',
  'FOX', 'CNN', 'NBC NEWS', 'THE WASHINGTON POST',
];

export const partnerAgencies = [
  'LAPD', 'SFPD', 'Miami PD', 'Denver Fire', 'Travis County', 'Phoenix PD',
  'Clark County SAR', 'NYPD ESU', 'Seattle FD', 'Dallas PD', 'Austin PD', 'Chicago FD',
];
