import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-xl font-bold">
          E-CELL
        </div>

        <div className="hidden md:flex gap-8 text-sm text-gray-400">
          <a href="#about">About</a>
          <a href="#process">Process</a>
          <a href="#departments">Departments</a>
        </div>

        <Link
          href="/login"
          className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white hover:text-black transition"
        >
          Apply Now
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">

        <p className="mb-6 text-sm uppercase tracking-[0.3em] text-gray-400">
          E-Cell Recruitment 2026
        </p>

        <h1 className="max-w-5xl text-6xl font-bold tracking-tight md:text-8xl">
          BUILD.
          <br />
          CREATE.
          <br />
          <span className="text-gray-500">LEAD.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg text-gray-400">
          Join the team that turns ideas into impact and builds
          the entrepreneurial ecosystem.
        </p>

        <Link
          href="/login"
          className="mt-10 rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
        >
          Apply for E-Cell →
        </Link>

      </section>

      {/* Process */}
      <section
        id="process"
        className="border-t border-white/10 px-8 py-24"
      >
        <div className="mx-auto max-w-6xl">

          <p className="text-sm uppercase tracking-widest text-gray-500">
            Recruitment Process
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Two rounds. One opportunity.
          </h2>

          <div className="mt-16 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 p-8">
              <p className="text-sm text-gray-500">01</p>
              <h3 className="mt-4 text-2xl font-semibold">
                Round 1
              </h3>
              <p className="mt-4 text-gray-400">
                Answer five questions and showcase your
                creativity, thinking and entrepreneurial mindset.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-8">
              <p className="text-sm text-gray-500">02</p>
              <h3 className="mt-4 text-2xl font-semibold">
                Round 2
              </h3>
              <p className="mt-4 text-gray-400">
                Selected candidates receive a department-specific
                task designed to test real-world skills.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-8">
              <p className="text-sm text-gray-500">03</p>
              <h3 className="mt-4 text-2xl font-semibold">
                Final Selection
              </h3>
              <p className="mt-4 text-gray-400">
                Complete the challenge and earn your place in
                the E-Cell team.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Departments */}
      <section
        id="departments"
        className="px-8 py-24"
      >
        <div className="mx-auto max-w-6xl">

          <p className="text-sm uppercase tracking-widest text-gray-500">
            Explore
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Find your department.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {[
              "Corporate",
              "Operations",
              "Design & Media",
              "Events",
              "Tech",
            ].map((department) => (
              <div
                key={department}
                className="rounded-2xl border border-white/10 p-6 transition hover:border-white/30"
              >
                <h3 className="font-semibold">
                  {department}
                </h3>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-8 py-32 text-center">

        <h2 className="text-5xl font-bold">
          Ready to build something?
        </h2>

        <p className="mt-6 text-gray-400">
          Your E-Cell journey starts here.
        </p>

        <Link
          href="/login"
          className="mt-10 inline-block rounded-full bg-white px-8 py-4 font-semibold text-black"
        >
          Start Application →
        </Link>

      </section>

    </main>
  );
}