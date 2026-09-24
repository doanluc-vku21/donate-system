'use client'

import Link from 'next/link'
import { useState } from 'react'

function formatMoney(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M14 8h3V4.5c-.5-.1-2.1-.2-4-.2-3.9 0-6.5 2.4-6.5 6.8V15H3v4h3.5v10H11V19h3.3l.7-4H11v-3.5C11 10.3 11.3 8 14 8Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M18.2 3H21l-6.1 7 7.1 11h-5.6l-4.4-6.8L6 21H3.2l7.5-8.6L3.9 3h5.7l4 6.2L18.2 3Zm-1 16.1h1.5L8.8 4.8H7.2l10 14.3Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M12 2a9.8 9.8 0 0 0-8.5 14.8L2 22l5.4-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.8-3.2-.3-.5.3-.5.8-1.5.1-.2.1-.4 0-.6l-.8-2c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 3 0 1.7 1.2 3.4 1.4 3.6.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M21.8 3.4 18.6 20c-.2 1.2-.9 1.5-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13.8l-4.8-1.5c-1.1-.3-1.1-1 .2-1.5L20.4 3.5c.9-.3 1.7.2 1.4-.1Z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
    </svg>
  )
}

export default function DonationPanel({
  campaignSlug,
  campaignTitle,
  raisedAmountCents,
  goalAmountCents,
  currency,
}: {
  campaignSlug: string
  campaignTitle: string
  raisedAmountCents: number
  goalAmountCents: number
  currency: string
}) {
  const [shareOpen, setShareOpen] =
    useState(false)

  const [copied, setCopied] =
    useState(false)

  const percentage =
    goalAmountCents > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (raisedAmountCents /
                goalAmountCents) *
                100
            )
          )
        )
      : 0

  function getShareUrl() {
    if (
      typeof window ===
      'undefined'
    ) {
      return ''
    }

    return window.location.href
  }

  function openShare(
    type:
      | 'facebook'
      | 'x'
      | 'whatsapp'
      | 'telegram'
      | 'email'
  ) {
    const url =
      encodeURIComponent(
        getShareUrl()
      )

    const title =
      encodeURIComponent(
        campaignTitle
      )

    const urls = {
      facebook:
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,

      x:
        `https://twitter.com/intent/tweet?url=${url}&text=${title}`,

      whatsapp:
        `https://wa.me/?text=${title}%20${url}`,

      telegram:
        `https://t.me/share/url?url=${url}&text=${title}`,

      email:
        `mailto:?subject=${title}&body=${title}%0A%0A${url}`,
    }

    if (type === 'email') {
      window.location.href =
        urls.email

      return
    }

    window.open(
      urls[type],
      '_blank',
      'noopener,noreferrer,width=700,height=600'
    )
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        getShareUrl()
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <aside className="rounded-2xl border border-[#dfe5e2] bg-white p-5 shadow-[0_10px_30px_rgba(17,50,40,0.04)] lg:sticky lg:top-24">
      {/* PROGRESS */}

      <div className="flex items-center gap-4">
        <div
          className="relative flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(
              #76bf3e 0% ${percentage}%,
              #edf1e9 ${percentage}% 100%
            )`,
          }}
        >
          <div className="flex h-[49px] w-[49px] items-center justify-center rounded-full bg-white">
            <span className="text-sm font-bold text-[#14233b]">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="leading-tight">
            <span className="text-[19px] font-bold text-[#111827]">
              {formatMoney(
                raisedAmountCents,
                currency
              )}
            </span>

            <span className="ml-1 text-sm font-medium text-neutral-500">
              raised of
            </span>
          </p>

          <p className="mt-1 text-base text-[#64748b] underline underline-offset-2">
            {formatMoney(
              goalAmountCents,
              currency
            )}
          </p>
        </div>
      </div>

      {/* DONATE */}

      <Link
        href={`/campaigns/${campaignSlug}/contribute`}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#baf477] px-5 py-3 text-base font-semibold text-[#124b31] transition hover:bg-[#aaf064]"
      >
        <span>♡</span>
        Donate
      </Link>

      {/* SHARE */}

      <button
        type="button"
        onClick={() =>
          setShareOpen(
            (current) =>
              !current
          )
        }
        className={`mx-auto mt-3 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
          shareOpen
            ? 'border-2 border-[#174d37] text-[#174d37]'
            : 'text-[#64748b] hover:bg-neutral-50'
        }`}
      >
        <span>♧</span>
        Share
      </button>

      {/* SHARE ICONS */}

      {shareOpen && (
        <div className="mt-2 border-t border-neutral-100 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              title="Share on Facebook"
              onClick={() =>
                openShare(
                  'facebook'
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5e2] bg-white text-[#111827] shadow-sm transition hover:-translate-y-0.5 hover:border-[#174d37]"
            >
              <FacebookIcon />
            </button>

            <button
              type="button"
              title="Share on X"
              onClick={() =>
                openShare('x')
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5e2] bg-white text-[#111827] shadow-sm transition hover:-translate-y-0.5 hover:border-[#174d37]"
            >
              <XIcon />
            </button>

            <button
              type="button"
              title="Share on WhatsApp"
              onClick={() =>
                openShare(
                  'whatsapp'
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5e2] bg-white text-[#111827] shadow-sm transition hover:-translate-y-0.5 hover:border-[#174d37]"
            >
              <WhatsAppIcon />
            </button>

            <button
              type="button"
              title="Share on Telegram"
              onClick={() =>
                openShare(
                  'telegram'
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5e2] bg-white text-[#111827] shadow-sm transition hover:-translate-y-0.5 hover:border-[#174d37]"
            >
              <TelegramIcon />
            </button>

            <button
              type="button"
              title="Share by Email"
              onClick={() =>
                openShare(
                  'email'
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5e2] bg-white text-[#111827] shadow-sm transition hover:-translate-y-0.5 hover:border-[#174d37]"
            >
              <EmailIcon />
            </button>

            <button
              type="button"
              title="Copy link"
              onClick={copyLink}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5e2] bg-white text-[#111827] shadow-sm transition hover:-translate-y-0.5 hover:border-[#174d37]"
            >
              <LinkIcon />

              {copied && (
                <span className="absolute -bottom-8 whitespace-nowrap rounded bg-[#173f35] px-2 py-1 text-[10px] font-semibold text-white">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SECURE */}

      <div className="mt-5 border-t border-neutral-100 pt-5 text-center">
        <p className="flex items-center justify-center gap-2 text-xs text-[#73839b]">
          <span>♙</span>
          Secure payment through Stripe
        </p>
      </div>
    </aside>
  )
}