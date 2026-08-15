"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"

const members = [
  {
    name: "BHARANI KUMAR S",
    role: "Founder & Head",
    bio: "BHARANI KUMAR S is the founder and head of FoodiezX, guiding the product, engineering, and customer experience as an independent solo team.",
    emoji: "BK",
  },
]

const values = [
  { n: "01", title: "Ship and iterate", body: "We'd rather fix a live product than perfect a prototype." },
  { n: "02", title: "Own the outcome", body: "No hand-offs. Whoever ships it supports it." },
  { n: "03", title: "Customer first, always", body: "If it isn't better for the customer, we don't do it." },
]

export function Team() {
  return (
    <InfoPage title="Our Team" subtitle="Small team. Big appetite.">
      <p>
        FoodiezX is an independent project led by BHARANI KUMAR S. As a solo team, every product,
        engineering, and design decision is driven by one goal: making your next meal better than the last.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {members.map((m) => (
          <div key={m.name} className="border border-border rounded-lg p-4 flex gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
              {m.emoji}
            </div>
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-primary font-medium mb-1">{m.role}</p>
              <p className="text-muted-foreground">{m.bio}</p>
            </div>
          </div>
        ))}
      </div>
      <h2>How we work</h2>
      <div className="space-y-3">
        {values.map((v) => (
          <div key={v.n} className="flex gap-4 items-start">
            <span className="text-2xl font-bold text-primary/40">{v.n}</span>
            <div>
              <p className="font-semibold">{v.title}</p>
              <p className="text-muted-foreground">{v.body}</p>
            </div>
          </div>
        ))}
      </div>
      <p>
        Want to follow the project? See the <Link to="/careers">FoodiezX updates</Link>.
      </p>
    </InfoPage>
  )
}
