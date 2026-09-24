export default function FAQSection() {
  const faqs = [
    {
      question:
        'Do I need an account to donate?',
      answer:
        'No. Donors can complete a donation without creating an account.',
    },
    {
      question:
        'Can I make a monthly donation?',
      answer:
        'Campaigns may support both one-time and recurring monthly donations depending on their settings.',
    },
    {
      question:
        'Can I donate anonymously?',
      answer:
        'If enabled by the campaign, you can choose to keep your name private from public donor displays.',
    },
    {
      question:
        'How will I know how funds are used?',
      answer:
        'Campaign pages can include planned fund usage, progress information and ongoing campaign updates.',
    },
  ]

  return (
    <section
      id="faq"
      className="px-5 pb-24 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
            Questions
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#173f35]">
            Feel informed before you give.
          </h2>
        </div>

        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-semibold text-[#173f35]">
                {faq.question}

                <span className="text-xl transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="max-w-3xl pb-6 text-sm leading-7 text-neutral-500">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}