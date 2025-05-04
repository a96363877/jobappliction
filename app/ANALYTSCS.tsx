import { headers } from "next/headers"
import Script from "next/script"

// Example list of country codes where you might want to disable analytics
const EXCLUDED_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]

export default function Analytics() {
  const countryCode = headers().get("x-vercel-ip-country") || "US"

  if (EXCLUDED_COUNTRIES.includes(countryCode)) {
    return null
  }

  return <Script src="https://shown.io/metrics/RB3erP2G8W" defer strategy="afterInteractive" />
}
