"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"
import { MapPin, Briefcase } from "lucide-react"
import { Button } from "../../ui/button"
import { toast } from "sonner"

const openings = [
  { role: "Senior iOS Engineer", team: "Product Engineering", location: "New Delhi (Hybrid)" },
  { role: "Backend Engineer", team: "Platform", location: "New Delhi (Hybrid)" },
  { role: "Growth Marketing Manager", team: "Marketing", location: "New Delhi (On-site)" },
  { role: "Customer Support Lead", team: "Support", location: "Remote (India)" },
  { role: "Rider Operations Analyst", team: "Operations", location: "New Delhi (On-site)" },
  { role: "Restaurant Partnerships Executive", team: "Supply", location: "Gurgaon (On-site)" },
]

const benefits = [
  "Competitive salary with an annual equity refresh",
  "Flexible hybrid working and unlimited snack budget",
  "Health insurance for you and your dependents",
  "Annual learning budget of ₹50,000",
  "Free FoodiezX Pro membership and rider gear discounts",
]

export function Careers() {
  return (
    <InfoPage title="Careers" subtitle="Build the future of food with us">
      <p>
        We hire builders, not job-holders. At FoodiezX, every team member owns outcomes end to end —
        from shipping the feature to watching customers use it. If you care deeply about craft and
        want your work to reach millions of plates, you'll fit right in.
      </p>
      <h2>Open roles</h2>
      <div className="space-y-2">
        {openings.map((o) => (
          <div key={o.role} className="flex items-center justify-between border border-border rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors">
            <div>
              <p className="font-semibold">{o.role}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <Briefcase className="w-3 h-3" /> {o.team}
                <MapPin className="w-3 h-3" /> {o.location}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Application flow for "${o.role}" is demo-only — thanks for your interest!`)}
            >
              Apply
            </Button>
          </div>
        ))}
      </div>
      <h2>What we offer</h2>
      <ul>
        {benefits.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p>
        Don't see your role? We're always looking for exceptional people. Write to us at{" "}
        <Link to="/contact">careers@foodiezx.com</Link>.
      </p>
    </InfoPage>
  )
}
