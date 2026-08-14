"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"
import { TrendingUp, Store, Truck, BarChart3 } from "lucide-react"
import { Button } from "../../ui/button"
import { toast } from "sonner"

const benefits = [
  { icon: TrendingUp, title: "Grow your reach", body: "Instant access to 1.2M+ hungry customers across New Delhi and NCR." },
  { icon: Store, title: "Zero setup cost", body: "Onboarding is free. We help you photograph your menu and set up your storefront." },
  { icon: Truck, title: "We handle delivery", body: "Our rider fleet picks up and delivers every order. You just cook." },
  { icon: BarChart3, title: "Data & insights", body: "A partner dashboard shows sales, ratings and demand trends so you can plan better." },
]

const steps = [
  { n: 1, title: "Apply", body: "Fill in the short application — takes 5 minutes." },
  { n: 2, title: "Menu review", body: "Our team reviews your menu and helps you price for delivery." },
  { n: 3, title: "Go live", body: "Your restaurant is live on FoodiezX within 7 days of signing." },
]

export function Partner() {
  return (
    <InfoPage title="Partner With Us" subtitle="Join 500+ restaurants growing with FoodiezX">
      <p>
        FoodiezX is more than a delivery channel — it's a growth engine for restaurants of every size,
        from family-run dhabas to established chains. We've helped partners lift order volumes by an
        average of 40% in their first quarter.
      </p>
      <h2>Why partner with us</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {benefits.map((b) => (
          <div key={b.title} className="border border-border rounded-lg p-4 flex gap-3">
            <b.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{b.title}</p>
              <p className="text-sm text-muted-foreground">{b.body}</p>
            </div>
          </div>
        ))}
      </div>
      <h2>How it works</h2>
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 items-start">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{s.n}</span>
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-muted-foreground">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2">
        <Button onClick={() => toast.success("Application flow is demo-only — we'll be in touch!")}>
          Apply to list your restaurant
        </Button>
      </div>
      <p className="pt-2">
        Questions? Visit the <Link to="/help">help center</Link> or <Link to="/contact">reach out directly</Link>.
      </p>
    </InfoPage>
  )
}
