"use client"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

interface InfoPageProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

/** Shared shell for static info/legal pages so they share one consistent layout. */
export function InfoPage({ title, subtitle, children }: InfoPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
        <Link to="/" className="p-1 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {title}
      </h1>
      {subtitle && <p className="text-muted-foreground mb-8 ml-8">{subtitle}</p>}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-5 text-sm leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:pt-3 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline">
        {children}
      </div>
    </div>
  )
}
