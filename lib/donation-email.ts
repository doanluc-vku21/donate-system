import { resend } from '@/lib/resend'

type SendDonationEmailParams = {
  donationId: string

  donorEmail: string
  donorFirstName?: string | null

  campaignTitle: string
  campaignSlug: string

  amountCents: number
  feeAmountCents: number
  totalAmountCents: number

  currency: string

  frequency:
    | 'one_time'
    | 'monthly'

  createdAt: string
}

function money(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency:
        currency.toUpperCase(),
    }
  ).format(
    cents / 100
  )
}

function escapeHtml(
  value: string
) {
  return value
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    )
}

export async function sendDonationConfirmationEmail({
  donationId,
  donorEmail,
  donorFirstName,

  campaignTitle,
  campaignSlug,

  amountCents,
  feeAmountCents,
  totalAmountCents,

  currency,
  frequency,

  createdAt,
}: SendDonationEmailParams) {
  const from =
    process.env
      .DONATION_EMAIL_FROM

  if (!from) {
    throw new Error(
      'Missing DONATION_EMAIL_FROM.'
    )
  }

  const replyTo =
    process.env
      .DONATION_REPLY_TO

  const siteUrl =
    (
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000'
    ).replace(
      /\/$/,
      ''
    )

  const safeFirstName =
    donorFirstName
      ? escapeHtml(
          donorFirstName
        )
      : 'there'

  const safeCampaignTitle =
    escapeHtml(
      campaignTitle
    )

  const campaignUrl =
    `${siteUrl}/campaigns/${campaignSlug}`

  const amount =
    money(
      amountCents,
      currency
    )

  const fee =
    money(
      feeAmountCents,
      currency
    )

  const total =
    money(
      totalAmountCents,
      currency
    )

  const frequencyLabel =
    frequency ===
    'monthly'
      ? 'Monthly donation'
      : 'One-time donation'

  const date =
    new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    ).format(
      new Date(
        createdAt
      )
    )

  const subject =
    frequency ===
    'monthly'
      ? `Thank you for your monthly donation to ${campaignTitle}`
      : `Thank you for supporting ${campaignTitle}`

  const html = `
<!doctype html>
<html>
  <body
    style="
      margin:0;
      padding:0;
      background:#f5f5f1;
      font-family:Arial,Helvetica,sans-serif;
      color:#173f35;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        background:#f5f5f1;
        padding:32px 16px;
      "
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              max-width:600px;
              background:#ffffff;
              border-radius:20px;
              overflow:hidden;
              border:1px solid #e8e8e2;
            "
          >
            <tr>
              <td
                style="
                  padding:36px 36px 20px;
                "
              >
                <div
                  style="
                    display:inline-block;
                    background:#173f35;
                    color:#ffffff;
                    width:44px;
                    height:44px;
                    line-height:44px;
                    border-radius:50%;
                    text-align:center;
                    font-weight:700;
                    font-size:20px;
                  "
                >
                  H
                </div>

                <h1
                  style="
                    margin:24px 0 0;
                    font-size:30px;
                    line-height:1.15;
                    color:#173f35;
                  "
                >
                  Thank you for your support.
                </h1>

                <p
                  style="
                    margin:18px 0 0;
                    font-size:16px;
                    line-height:1.7;
                    color:#5f6763;
                  "
                >
                  Hi ${safeFirstName},
                </p>

                <p
                  style="
                    margin:10px 0 0;
                    font-size:16px;
                    line-height:1.7;
                    color:#5f6763;
                  "
                >
                  Your donation to
                  <strong>${safeCampaignTitle}</strong>
                  has been confirmed.
                  Your support helps move this campaign forward.
                </p>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:16px 36px 28px;
                "
              >
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    background:#f7f8f4;
                    border-radius:14px;
                    padding:22px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding-bottom:12px;
                        font-size:14px;
                        color:#777f7a;
                      "
                    >
                      Donation
                    </td>

                    <td
                      align="right"
                      style="
                        padding-bottom:12px;
                        font-size:15px;
                        font-weight:700;
                        color:#173f35;
                      "
                    >
                      ${amount}
                    </td>
                  </tr>

                  ${
                    feeAmountCents >
                    0
                      ? `
                  <tr>
                    <td
                      style="
                        padding-bottom:12px;
                        font-size:14px;
                        color:#777f7a;
                      "
                    >
                      Processing contribution
                    </td>

                    <td
                      align="right"
                      style="
                        padding-bottom:12px;
                        font-size:15px;
                        font-weight:600;
                        color:#173f35;
                      "
                    >
                      ${fee}
                    </td>
                  </tr>
                  `
                      : ''
                  }

                  <tr>
                    <td
                      style="
                        padding-top:14px;
                        border-top:1px solid #e3e5df;
                        font-size:14px;
                        font-weight:700;
                      "
                    >
                      Total
                    </td>

                    <td
                      align="right"
                      style="
                        padding-top:14px;
                        border-top:1px solid #e3e5df;
                        font-size:18px;
                        font-weight:700;
                        color:#173f35;
                      "
                    >
                      ${total}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding-top:14px;
                        font-size:14px;
                        color:#777f7a;
                      "
                    >
                      Frequency
                    </td>

                    <td
                      align="right"
                      style="
                        padding-top:14px;
                        font-size:14px;
                        font-weight:600;
                      "
                    >
                      ${frequencyLabel}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding-top:10px;
                        font-size:14px;
                        color:#777f7a;
                      "
                    >
                      Date
                    </td>

                    <td
                      align="right"
                      style="
                        padding-top:10px;
                        font-size:14px;
                        font-weight:600;
                      "
                    >
                      ${date}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding-top:10px;
                        font-size:14px;
                        color:#777f7a;
                      "
                    >
                      Donation ID
                    </td>

                    <td
                      align="right"
                      style="
                        padding-top:10px;
                        font-size:12px;
                        color:#777f7a;
                      "
                    >
                      ${escapeHtml(
                        donationId
                      )}
                    </td>
                  </tr>
                </table>

                <div
                  style="
                    text-align:center;
                    margin-top:28px;
                  "
                >
                  <a
                    href="${campaignUrl}"
                    style="
                      display:inline-block;
                      background:#173f35;
                      color:#ffffff;
                      text-decoration:none;
                      padding:13px 24px;
                      border-radius:999px;
                      font-size:14px;
                      font-weight:700;
                    "
                  >
                    View campaign
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:24px 36px 36px;
                  border-top:1px solid #eeeeea;
                "
              >
                <p
                  style="
                    margin:0;
                    font-size:13px;
                    line-height:1.7;
                    color:#8a918d;
                  "
                >
                  This email confirms your donation through HopeFund.
                  Payment processing is handled securely by Stripe.
                </p>

                <p
                  style="
                    margin:12px 0 0;
                    font-size:13px;
                    color:#8a918d;
                  "
                >
                  Thank you for giving with purpose.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `

  const result =
    await resend.emails.send(
      {
        from,

        to: [
          donorEmail,
        ],

        subject,

        html,

        ...(replyTo
          ? {
              replyTo,
            }
          : {}),
      },

      {
        idempotencyKey:
          `donation-confirmation/${donationId}`,
      }
    )

  if (result.error) {
    throw new Error(
      result.error.message
    )
  }

  if (!result.data?.id) {
    throw new Error(
      'Resend did not return an email ID.'
    )
  }

  return result.data.id
}