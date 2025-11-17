import React from 'react'

// Simple promotional flyer component — two-column layout with CTA and image.
export default function Flyer({ title = 'Download Our Pharmacy Flyer', description = 'Share with your network and onboard more pharmacies quickly.', image = '/f1.png' }) {
  return (
    <section className="mt-16 bg-white py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="mt-4 text-gray-600">{description}</p>
          <div className="mt-6 flex gap-4">
            <a href={image} download className="btn-brand px-5 py-3">Download Flyer</a>
            <a href="/contact" className="px-5 py-3 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-50">Contact Sales</a>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <img src={image} alt="MediBot flyer" className="w-full max-w-sm rounded-lg shadow-md" />
        </div>
      </div>
    </section>
  )
}
