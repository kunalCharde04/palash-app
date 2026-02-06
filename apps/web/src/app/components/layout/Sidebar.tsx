"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BookOpen, ChevronLeft, CreditCard, Layout, Settings, Users, Plus, Crown } from "lucide-react"

import { cn } from "@/app/lib/utils"

const routes = [
 
  {
    label: "Users",
    icon: Users,
    href: "/admin-dashboard/users",
  },
  {
    label: "Bookings",
    icon: BookOpen,
    href: "/admin-dashboard/bookings",
  },
  {
    label: "Services",
    icon: CreditCard,
    href: "/admin-dashboard/services",
  },
  {
    label: "Membership Requests",
    icon: Crown,
    href: "/admin-dashboard/membership-requests",
  },
  {
    label: "RFID Card Usage",
    icon: BarChart3,
    href: "/admin-dashboard/rfid-usage",
  },
  {
    label: "Manage RFID",
    icon: Settings,
    href: "/admin-dashboard/rfid",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full  text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-lg font-bold flex items-center">
            <ChevronLeft />
Back to site
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "bg-white/10 text-white" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

