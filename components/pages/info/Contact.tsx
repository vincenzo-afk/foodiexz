"use client"
import { useState } from "react"
import { InfoPage } from "../../InfoPage"
import { Mail, Phone, MapPin } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { toast } from "sonner"

export function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
      if (res.ok) {
        toast.success("Message sent! We'll reply within 24 hours.")
        setName(""); setEmail(""); setMessage("")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <InfoPage title="Contact Us" subtitle="We'd love to hear from you">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 flex gap-3">
          <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">careers@foodiezx.com</p>
          </div>
        </div>
        <div className="border border-border rounded-lg p-4 flex gap-3">
          <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Phone</p>
            <p className="text-sm text-muted-foreground">+91 98000 00000</p>
          </div>
        </div>
        <div className="border border-border rounded-lg p-4 flex gap-3 sm:col-span-2">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Office</p>
            <p className="text-sm text-muted-foreground">4th Floor, Tower B, Connaught Place, New Delhi, 110001</p>
          </div>
        </div>
      </div>
      <h2>Send us a message</h2>
      <form onSubmit={submit} className="space-y-3">
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Textarea placeholder="How can we help?" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type="submit" disabled={sending}>{sending ? "Sending..." : "Send message"}</Button>
      </form>
    </InfoPage>
  )
}
