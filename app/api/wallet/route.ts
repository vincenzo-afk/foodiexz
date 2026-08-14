import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export interface DbWalletTx {
  id: string
  userId: string
  amount: number
  type: "credit" | "debit"
  reason: string
  at: number
}

// Simple in-memory wallet transaction log so top-ups are visible in Settings.
const transactions: DbWalletTx[] = []

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const capped = Math.min(amount, 10000)
    const user = db.getUserById(auth.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    db.updateUserWallet(user.id, user.wallet + capped)
    transactions.push({
      id: "WT" + Date.now(),
      userId: user.id,
      amount: capped,
      type: "credit",
      reason: body.reason || "Wallet top-up",
      at: Date.now(),
    })
    return NextResponse.json({ wallet: user.wallet + capped })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Wallet update failed" }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const user = db.getUserById(auth.userId)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json({
    wallet: user.wallet,
    transactions: transactions.filter((t) => t.userId === user.id).slice(-20),
  })
}

export interface WalletDeduction { success: boolean }

/** Called internally by other routes; no auth check (caller is server code).
 * Debits `amount` from the user's wallet if sufficient; returns { success }. */
export function deductWallet(userId: string, amount: number, reason: string): WalletDeduction {
  const user = db.getUserById(userId)
  if (!user || user.wallet < amount) return { success: false }
  db.updateUserWallet(userId, user.wallet - amount)
  transactions.push({
    id: "WT" + Date.now(),
    userId,
    amount,
    type: "debit",
    reason,
    at: Date.now(),
  })
  return { success: true }
}
