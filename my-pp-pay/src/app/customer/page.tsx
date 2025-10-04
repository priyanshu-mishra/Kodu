import Image from 'next/image'

export default function CustomerPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      {/* Container to center the image */}
      <div className="relative w-full h-[calc(100vh-4rem)]">
        <Image
          src="/images/image-2.jpg"  // path inside /public
          alt="Customer view"
          fill
          priority
          className="object-cover object-center"
        />
      </div>
    </main>
  )
}
