"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"

const members = [
  { name: "Aryan Sharma", role: "Co-Founder & CEO", bio: "Former product lead at a top-3 delivery platform. Aryan believes the last mile is the entire game.", emoji: "👨‍💼" },
  { name: "Priya Verma", role: "Co-Founder & CTO", bio: "Systems engineer who has scaled dispatch algorithms across three Indian metros. Builds what Aryan dreams up.", emoji: "👩‍💻" },
  { name: "Rohan Mehta", role: "COO", bio: "Ex-operations at a national retail chain. Runs rider operations and keeps 98% of orders on time.", emoji: "🧑‍✈️" },
  { name: "Sana Iyer", role: "Head of Design", bio: "Turned three food apps into award-winning products. Owns every pixel you see on FoodiezX.", emoji: "👩‍🎨" },
  { name: "Kartik Nair", role: "Head of Restaurant Partnerships", bio: "Has signed over 400 restaurants. Knows every chef in Delhi personally.", emoji: "🤝" },
  { name: "Meera Joshi", role: "Head of Customer Support", bio: "Runs a support team with a 4.9 satisfaction score and a 5-minute first response.", emoji: "🎧" },
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
        FoodiezX is run by a tight-knit crew of operators, engineers and food lovers. We come from
        delivery platforms, retail chains and design studios — and we all share one obsession: making
        your next meal better than the last.
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
        We're hiring! See our <Link to="/careers">open roles</Link>.
      </p>
    </InfoPage>
  )
}
