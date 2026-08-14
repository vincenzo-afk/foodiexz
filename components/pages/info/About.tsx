"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"
import { Bike, Clock, ShieldCheck, Heart } from "lucide-react"
import { Button } from "../../ui/button"

const pillars = [
  { icon: Clock, title: "Fast delivery", body: "Most orders land at your door in under 30 minutes, tracked live from kitchen to doorstep." },
  { icon: ShieldCheck, title: "Trusted partners", body: "Every restaurant on FoodiezX is verified, rated and reviewed by real customers." },
  { icon: Bike, title: "Reliable riders", body: "Our rider fleet is trained, GPS-tracked and rated, so your food arrives hot and safe." },
  { icon: Heart, title: "Made with care", body: "From the first click to the last bite, every detail of the experience is designed around you." },
]

export function About() {
  return (
    <InfoPage title="About Us" subtitle="The story behind FoodiezX">
      <p>
        FoodiezX was born from a simple observation: great food is everywhere, but getting it to you
        quickly and reliably shouldn't be a gamble. We started in New Delhi in 2023 as a small team of
        three, and today we connect thousands of households with the city's best restaurants.
      </p>
      <p>
        We are not just a delivery app. We are a marketplace that helps local restaurants grow, riders
        earn a dependable income, and you discover new favorites without leaving the couch. Our mission
        is to make every meal effortless, and our vision is a city where no one cooks on a tired
        Tuesday night unless they want to.
      </p>
      <h2>What we stand for</h2>
      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        {pillars.map((p) => (
          <div key={p.title} className="border border-border rounded-lg p-4 flex gap-3">
            <p.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">{p.title}</p>
              <p className="text-muted-foreground">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
      <h2>By the numbers</h2>
      <div className="grid grid-cols-3 gap-4 text-center pt-2">
        {[
          { n: "500+", label: "Restaurants" },
          { n: "1.2M", label: "Orders delivered" },
          { n: "4.6", label: "Average rating" },
        ].map((s) => (
          <div key={s.label} className="border border-border rounded-lg py-4">
            <p className="text-2xl font-bold text-primary">{s.n}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="pt-2">
        <Button asChild>
          <Link to="/team">Meet the team</Link>
        </Button>
      </div>
    </InfoPage>
  )
}
