export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Find a story',
      description:
        'Explore verified campaigns and learn about the people and communities behind them.',
    },
    {
      number: '02',
      title: 'Choose your support',
      description:
        'Select a suggested amount or enter a contribution that feels right for you.',
    },
    {
      number: '03',
      title: 'Make an impact',
      description:
        'Donate securely and follow campaign updates to see how support is making a difference.',
    },
  ]

  return (
    <section
      id="how-it-works"
      className="bg-[#edf4e7] px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
            Simple. Human. Transparent.
          </p>

          <h2 className="mt-3 max-w-md text-4xl font-bold tracking-[-0.04em] text-[#173f35] sm:text-5xl">
            Helping starts with a story.
          </h2>

          <p className="mt-5 max-w-md text-sm leading-7 text-neutral-600">
            Take a moment to understand the need, choose how you want to help,
            and support securely.
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          {steps.map(
            (step, index) => (
              <div
                key={step.number}
                className={`grid gap-4 py-6 sm:grid-cols-[60px_1fr] ${
                  index !== 0
                    ? 'border-t border-neutral-100'
                    : ''
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf4e7] text-sm font-bold text-[#173f35]">
                  {step.number}
                </div>

                <div>
                  <h3 className="font-bold text-[#173f35]">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}