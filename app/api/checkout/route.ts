import {
  NextRequest,
  NextResponse,
} from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

type CheckoutBody = {
  campaignId?: string

  amountCents?: number

  frequency?:
    | 'one_time'
    | 'monthly'

  anonymous?: boolean

  coverFee?: boolean

  donor?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    message?: string
  }
}

function calculateCoverFee(
  amountCents: number,
  percentage: number,
  fixedCents: number
) {
  const rate =
    percentage / 100

  if (
    rate < 0 ||
    rate >= 1
  ) {
    return 0
  }

  if (
    rate === 0 &&
    fixedCents === 0
  ) {
    return 0
  }

  const grossTotal =
    (amountCents +
      fixedCents) /
    (1 - rate)

  return Math.max(
    0,
    Math.ceil(
      grossTotal -
        amountCents
    )
  )
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as
        CheckoutBody

    const campaignId =
      String(
        body.campaignId ||
          ''
      ).trim()

    const amountCents =
      Number(
        body.amountCents
      )

    const frequency =
      body.frequency

    const donor =
      body.donor

    if (!campaignId) {
      return NextResponse.json(
        {
          error:
            'Campaign is required.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !Number.isInteger(
        amountCents
      ) ||
      amountCents <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid donation amount.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      frequency !==
        'one_time' &&
      frequency !==
        'monthly'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid donation frequency.',
        },
        {
          status: 400,
        }
      )
    }

    const firstName =
      String(
        donor?.firstName ||
          ''
      ).trim()

    const lastName =
      String(
        donor?.lastName ||
          ''
      ).trim()

    const email =
      String(
        donor?.email || ''
      )
        .trim()
        .toLowerCase()

    const phone =
      String(
        donor?.phone || ''
      ).trim()

    const message =
      String(
        donor?.message ||
          ''
      )
        .trim()
        .slice(0, 400)

    if (
      !firstName ||
      !lastName ||
      !email
    ) {
      return NextResponse.json(
        {
          error:
            'Donor information is incomplete.',
        },
        {
          status: 400,
        }
      )
    }

    const supabase =
      await createClient()

    // =========================
    // CAMPAIGN
    // =========================

    const {
      data: campaign,
      error: campaignError,
    } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        slug,
        currency,
        status
      `)
      .eq(
        'id',
        campaignId
      )
      .eq(
        'status',
        'published'
      )
      .single()

    if (
      campaignError ||
      !campaign
    ) {
      return NextResponse.json(
        {
          error:
            'Campaign is not available for donations.',
        },
        {
          status: 404,
        }
      )
    }

    // =========================
    // SETTINGS
    // =========================

    const {
      data: settings,
    } = await supabase
      .from(
        'campaign_donation_settings'
      )
      .select(`
        enable_one_time,
        enable_monthly,
        allow_custom_amount,
        allow_anonymous,
        allow_cover_fee,
        minimum_amount_cents
      `)
      .eq(
        'campaign_id',
        campaign.id
      )
      .maybeSingle()

    const resolvedSettings =
      settings ?? {
        enable_one_time: true,
        enable_monthly: false,
        allow_custom_amount:
          true,
        allow_anonymous: true,
        allow_cover_fee: true,
        minimum_amount_cents:
          100,
      }

    // =========================
    // FREQUENCY VALIDATION
    // =========================

    if (
      frequency ===
        'monthly' &&
      !resolvedSettings
        .enable_monthly
    ) {
      return NextResponse.json(
        {
          error:
            'Monthly donations are not enabled for this campaign.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      frequency ===
        'one_time' &&
      !resolvedSettings
        .enable_one_time
    ) {
      return NextResponse.json(
        {
          error:
            'One-time donations are not enabled for this campaign.',
        },
        {
          status: 400,
        }
      )
    }

    // =========================
    // AMOUNT VALIDATION
    // =========================

    if (
      amountCents <
      resolvedSettings
        .minimum_amount_cents
    ) {
      return NextResponse.json(
        {
          error:
            'Donation amount is below the minimum.',
        },
        {
          status: 400,
        }
      )
    }

    const {
      data: matchingOption,
    } = await supabase
      .from(
        'campaign_donation_options'
      )
      .select('id')
      .eq(
        'campaign_id',
        campaign.id
      )
      .eq(
        'amount_cents',
        amountCents
      )
      .eq(
        'is_active',
        true
      )
      .maybeSingle()

    if (
      !matchingOption &&
      !resolvedSettings
        .allow_custom_amount
    ) {
      return NextResponse.json(
        {
          error:
            'Custom donation amounts are not enabled.',
        },
        {
          status: 400,
        }
      )
    }

    // =========================
    // FLAGS
    // =========================

    const anonymous =
      resolvedSettings
        .allow_anonymous
        ? Boolean(
            body.anonymous
          )
        : false

    const coverFee =
      resolvedSettings
        .allow_cover_fee
        ? Boolean(
            body.coverFee
          )
        : false

    // =========================
    // FEE
    // =========================

    const feePercent =
      Number(
        process.env
          .DONATION_FEE_PERCENT ??
          '2.9'
      )

    const feeFixedCents =
      Number(
        process.env
          .DONATION_FEE_FIXED_CENTS ??
          '30'
      )

    const feeCents =
      coverFee
        ? calculateCoverFee(
            amountCents,
            Number.isFinite(
              feePercent
            )
              ? feePercent
              : 2.9,
            Number.isFinite(
              feeFixedCents
            )
              ? feeFixedCents
              : 30
          )
        : 0

    // =========================
    // URLS
    // =========================

    const siteUrl =
      (
        process.env
          .NEXT_PUBLIC_SITE_URL ||
        request.nextUrl.origin
      ).replace(/\/$/, '')

    const metadata = {
      campaign_id:
        campaign.id,

      campaign_slug:
        campaign.slug,

      donation_amount_cents:
        String(amountCents),

      fee_amount_cents:
        String(feeCents),

      frequency,

      anonymous:
        String(anonymous),

      donor_first_name:
        firstName.slice(
          0,
          100
        ),

      donor_last_name:
        lastName.slice(
          0,
          100
        ),

      donor_email:
        email.slice(
          0,
          200
        ),

      donor_phone:
        phone.slice(
          0,
          100
        ),

      donor_message:
        message.slice(
          0,
          400
        ),
    }

    // =========================
    // LINE ITEMS
    // =========================

    const donationLineItem =
      {
        quantity: 1,

        price_data: {
          currency:
            campaign.currency.toLowerCase(),

          unit_amount:
            amountCents,

          product_data: {
            name:
              `Donation — ${campaign.title}`,
          },

          ...(frequency ===
          'monthly'
            ? {
                recurring: {
                  interval:
                    'month' as const,
                },
              }
            : {}),
        },
      }

    const lineItems:
      typeof donationLineItem[] =
      [
        donationLineItem,
      ]

    if (feeCents > 0) {
      lineItems.push({
        quantity: 1,

        price_data: {
          currency:
            campaign.currency.toLowerCase(),

          unit_amount:
            feeCents,

          product_data: {
            name:
              'Processing cost contribution',
          },

          ...(frequency ===
          'monthly'
            ? {
                recurring: {
                  interval:
                    'month' as const,
                },
              }
            : {}),
        },
      })
    }

    // =========================
    // CREATE CHECKOUT
    // =========================

    const session =
      await stripe.checkout.sessions.create({
        mode:
          frequency ===
          'monthly'
            ? 'subscription'
            : 'payment',

        line_items:
          lineItems,

        customer_email:
          email,

        client_reference_id:
          campaign.id,

        metadata,

        ...(frequency ===
        'monthly'
          ? {
              subscription_data:
                {
                  metadata,
                },
            }
          : {
              customer_creation:
                'always' as const,

              payment_intent_data:
                {
                  metadata,
                },
            }),

        success_url:
          `${siteUrl}/donation/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${siteUrl}/campaigns/${campaign.slug}/contribute/details?amount=${amountCents}&frequency=${frequency}`,
      })

    if (!session.url) {
      return NextResponse.json(
        {
          error:
            'Unable to create Stripe Checkout.',
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      url: session.url,
    })
  } catch (error) {
    console.error(
      'Checkout error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Checkout failed.',
      },
      {
        status: 500,
      }
    )
  }
}