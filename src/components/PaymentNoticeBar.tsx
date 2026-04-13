/**
 * Toggle via `.env` / hosting env: `VITE_SHOW_PAYMENT_BAR=true` (any other value or unset = hidden).
 * Optional: set CONTACT_EMAIL for a mailto link in the bar.
 */
export const showPaymentNoticeBar = import.meta.env.VITE_SHOW_PAYMENT_BAR === 'true'

const CONTACT_EMAIL = ''

export default function PaymentNoticeBar() {
  if (!showPaymentNoticeBar) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-teal-700/30 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-teal-50 shadow-[0_-8px_32px_rgba(15,118,110,0.35)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-2 px-4 py-2.5 text-center sm:flex-row sm:gap-4 sm:py-3 sm:text-left md:px-8">
        <p className="text-xs font-medium leading-snug sm:text-sm">
          <span className="font-semibold text-white">Payment pending.</span>{' '}
          This site remains online while the agreed project balance is outstanding. Please remit the
          remainder so we can close the engagement in good standing.
        </p>
        {CONTACT_EMAIL ? (
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Project%20payment%20—%20Aerohorse`}
            className="shrink-0 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            data-cursor-hover
          >
            Contact to pay
          </a>
        ) : null}
      </div>
    </div>
  )
}
