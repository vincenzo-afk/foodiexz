"use client"
import { Link } from "react-router-dom"
import { UtensilsCrossed } from "lucide-react"
import { Button } from "../ui/button"

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 bg-primary/10 rounded-full mb-4">
        <UtensilsCrossed className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Looks like this page got eaten! Let's get you back to some good food.
      </p>
      <Button asChild size="lg">
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  )
}
