"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"

const types = [
  {
    name: "Essential",
    always: true,
    body: "Required for the site to function — they keep you signed in, remember your cart and save your address selection. These cannot be disabled.",
  },
  {
    name: "Preferences",
    always: false,
    body: "Remember your language, theme and other settings so the site looks and behaves the way you like on every visit.",
  },
  {
    name: "Analytics",
    always: false,
    body: "Help us understand which pages are used most and where things break, so we can keep improving FoodiezX. Data is aggregated and never tied to your identity.",
  },
]

export function Cookie() {
  return (
    <InfoPage
      title="Cookie Policy"
      subtitle="Last updated: August 14, 2026"
    >
      <p>
        FoodiezX uses cookies — small text files stored on your device — to make the site work,
        improve it, and personalize your experience. This policy explains what we use and how
        you can manage them.
      </p>
      <h2>Cookies we use</h2>
      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {types.map((t) => (
          <div key={t.name} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{t.name} cookies</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${t.always ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {t.always ? "Always on" : "Optional"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t.body}</p>
          </div>
        ))}
      </div>
      <h2>Consent & managing cookies</h2>
      <p>
        We ask for your consent before setting non-essential cookies. You can change your
        preferences any time from your account settings, or through your browser's cookie
        controls. Disabling essential cookies will break parts of the site, so we recommend
        keeping them enabled.
      </p>
      <p>
        For more detail on how your data is handled, see our{" "}
        <Link to="/privacy">Privacy Policy</Link>. Questions?{" "}
        <Link to="/contact">Contact us</Link>.
      </p>
    </InfoPage>
  )
}
