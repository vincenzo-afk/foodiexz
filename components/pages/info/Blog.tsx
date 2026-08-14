"use client"
import { InfoPage } from "../../InfoPage"
import { toast } from "sonner"
import { CalendarDays, Clock, ArrowRight } from "lucide-react"
import { Button } from "../../ui/button"

const posts = [
  {
    title: "5 ways to order smarter on a busy weeknight",
    excerpt:
      "Save your favorite restaurants, reuse your last order, and stack offers the right way. Here's the full playbook.",
    date: "Aug 4, 2026",
    read: "4 min read",
    emoji: "🌙",
  },
  {
    title: "How we keep your food hot",
    excerpt:
      "From insulated rider bags to kitchen hand-off SLAs, every minute of the journey is engineered around temperature.",
    date: "Jul 22, 2026",
    read: "6 min read",
    emoji: "🔥",
  },
  {
    title: "Rider stories: 10,000 deliveries on two wheels",
    excerpt:
      "Meet Vikram, our longest-serving rider in Delhi. He tells us what the job actually feels like — and what would make it better.",
    date: "Jul 10, 2026",
    read: "5 min read",
    emoji: "🛵",
  },
  {
    title: "The restaurant partner's guide to FoodiezX",
    excerpt:
      "Photography tips, menu engineering and how our ranking system actually works. Everything a new partner should know.",
    date: "Jun 28, 2026",
    read: "7 min read",
    emoji: "🍳",
  },
]

export function Blog() {
  return (
    <InfoPage title="Blog" subtitle="Stories, tips and behind-the-scenes">
      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.title} className="border border-border rounded-lg p-5 flex gap-4 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
              {p.emoji}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {p.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.read}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 self-start"
              onClick={() => toast(`"${p.title}" — full article coming soon`)}
            >
              Read <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </InfoPage>
  )
}
