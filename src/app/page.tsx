import LeadCaptureForm from '../components/LeadCaptureForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D2966] via-[#9C45A2] to-[#F1C141]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-6">
            Phik&apos;a Vehicle Protection
          </h1>
          <p className="text-xl mb-4">
            Discover your vehicle&apos;s true value and protection benefits
          </p>
          <p className="text-lg text-white/80">
            See how much your vehicle will depreciate and how protection can save you thousands
          </p>
        </div>

        {/* Lead Capture Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Get Started - Free Vehicle Value Report
          </h2>
          <LeadCaptureForm />
        </div>
      </div>
    </div>
  )
}