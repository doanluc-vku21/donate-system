'use client'

import {
  useEffect,
  useRef,
} from 'react'

import { useRouter } from 'next/navigation'

export default function ConfirmationRefresh() {
  const router = useRouter()

  const attempts =
    useRef(0)

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          attempts.current += 1

          if (
            attempts.current > 10
          ) {
            window.clearInterval(
              interval
            )

            return
          }

          router.refresh()
        },
        2000
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [router])

  return null
}