import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BarChart3, ShieldCheck, Users, BellRing, ArrowLeft, RefreshCw } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface AdminOverview {
  users: number
  restaurants: number
  openRestaurants: number
  activeOrders: number
  searches: number
  restaurantViews: number
  cartAdds: number
  confirmedOrders: number
  cancelledOrders: number
  revenue: number
  scheduledOrders: number
  failedNotifications: unknown[]
  recentAudit: { id: string; action: string; targetType: string; targetId: string; createdAt: string }[]
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: "user" | "admin" | "restaurant_manager"
  memberships?: { restaurantId: string }[]
}

export function Admin() {
  const { user, isAuthenticated } = useStore()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [nextOverview, nextUsers] = await Promise.all([api.getAdminOverview(), api.getAdminUsers()])
      setOverview(nextOverview)
      setUsers(Array.isArray(nextUsers) ? nextUsers : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load admin dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "admin") void load()
    else setLoading(false)
  }, [user?.role])

  const changeRole = async (id: string, role: string) => {
    try {
      await api.updateUserRole(id, role)
      setUsers((current) => current.map((item) => item.id === id ? { ...item, role: role as AdminUser["role"] } : item))
      toast.success("User role updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update role")
    }
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Admin access required</h1>
        <p className="text-muted-foreground mb-6">This workspace is available only to configured FoodiezX administrators.</p>
        <Button asChild><Link to="/">Back to FoodiezX</Link></Button>
      </div>
    )
  }

  if (loading || !overview) {
    return <div className="max-w-6xl mx-auto px-4 py-12"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
  }

  const metrics = [
    ["Users", overview.users, Users],
    ["Open restaurants", `${overview.openRestaurants}/${overview.restaurants}`, ShieldCheck],
    ["Active orders", overview.activeOrders, BellRing],
    ["Revenue", `₹${overview.revenue.toLocaleString("en-IN")}`, BarChart3],
  ] as const

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"><ArrowLeft className="w-4 h-4" /> FoodiezX</Link>
          <h1 className="text-3xl font-bold">Operations dashboard</h1>
          <p className="text-muted-foreground">Manage access, monitor order health, and review operational events.</p>
        </div>
        <Button variant="outline" onClick={() => void load()}><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(([label, value, Icon]) => <div key={label} className="bg-card border border-border rounded-xl p-5"><Icon className="w-5 h-5 text-primary mb-3" /><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border"><h2 className="font-bold">User access</h2><p className="text-sm text-muted-foreground mt-1">Assign platform roles with server-side enforcement.</p></div>
          <div className="divide-y divide-border">
            {users.map((item) => <div key={item.id} className="p-4 flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-medium truncate">{item.name}</p><p className="text-xs text-muted-foreground truncate">{item.email}</p></div><select value={item.role} onChange={(event) => void changeRole(item.id, event.target.value)} className="border border-border rounded-lg bg-background px-2 py-1.5 text-sm"><option value="user">User</option><option value="restaurant_manager">Restaurant manager</option><option value="admin">Admin</option></select></div>)}
            {users.length === 0 && <p className="p-5 text-sm text-muted-foreground">No users have signed up yet.</p>}
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border"><h2 className="font-bold">System health</h2><p className="text-sm text-muted-foreground mt-1">Signals that need operational attention.</p></div>
          <div className="p-5 space-y-4 text-sm"><div className="flex justify-between"><span>Confirmed orders</span><strong>{overview.confirmedOrders}</strong></div><div className="flex justify-between"><span>Cancelled orders</span><strong>{overview.cancelledOrders}</strong></div><div className="flex justify-between"><span>Scheduled orders</span><strong>{overview.scheduledOrders}</strong></div><div className="flex justify-between"><span>Failed notifications</span><strong className={overview.failedNotifications.length ? "text-destructive" : "text-emerald-600"}>{overview.failedNotifications.length}</strong></div></div>
        </section>
      </div>

      <section className="bg-card border border-border rounded-xl p-5"><h2 className="font-bold mb-4">Conversion funnel</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><div><p className="text-muted-foreground">Searches</p><p className="text-2xl font-bold mt-1">{overview.searches}</p></div><div><p className="text-muted-foreground">Restaurant views</p><p className="text-2xl font-bold mt-1">{overview.restaurantViews}</p></div><div><p className="text-muted-foreground">Cart additions</p><p className="text-2xl font-bold mt-1">{overview.cartAdds}</p></div><div><p className="text-muted-foreground">Confirmed orders</p><p className="text-2xl font-bold mt-1">{overview.confirmedOrders}</p></div></div></section>

      <section className="bg-card border border-border rounded-xl overflow-hidden"><div className="p-5 border-b border-border"><h2 className="font-bold">Recent audit activity</h2></div><div className="divide-y divide-border">{overview.recentAudit.map((entry) => <div key={entry.id} className="p-4 flex justify-between gap-4 text-sm"><span>{entry.action} · {entry.targetType}/{entry.targetId}</span><span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString("en-IN")}</span></div>)}{overview.recentAudit.length === 0 && <p className="p-5 text-sm text-muted-foreground">Audit activity will appear here.</p>}</div></section>
    </div>
  )
}
