'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
}

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <ul className="hidden md:flex items-center gap-0.5" role="list">
      {links.map((link) => {
        const isActive =
          link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                'after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[2px]',
                'after:bg-primary after:origin-left after:transition-transform after:duration-200',
                isActive
                  ? 'text-primary after:scale-x-100'
                  : 'text-stone hover:text-primary after:scale-x-0 hover:after:scale-x-100',
              )}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
