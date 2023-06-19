const faqs = [
    {
      id: 1,
      question: "What's this for?",
      answer:
        "This a multi-source API client for open-access and free Earth Obserbational Data. As time goes on we will add new features as well as new providers according to our needs. It is implemented with React. We do the user authentication behind the scenes for you so that the download of data is 1 click away from your browser!",
    },
    {
        id: 2,
        question: "Where do you get data from?",
        answer:
          "At the moment we are getting data from Element 84 open STAC API in which we can access Sentinel S2A Cloud Optimized. And the brand new Copernicus Data Space Ecosystem API from the European Space Agency (ESA) in which we can access Sentinel 1, Sentinel 2, Sentinel 3, Sentinel 5P, Landsat 5, Landsat 7 and Landsat 8 data.",
    },
    {
        id: 3,
        question: "Is my privacy safe?",
        answer:
          "We request location access of your browser for the Map but we don't store an sensible data, this is a front-end that runs on your browser on the client-side.",
    }
    // More questions...
  ]

  export default function FAQ() {
    return (
      <div className="mt-24">
        <div className="mx-auto max-w-7xl py-16 px-6 sm:py-24 lg:px-8">
          <h2 className="text-5xl font-bold leading-10 tracking-tight text-gray-900">About</h2>
          <p className="mt-6 max-w-2xl text-xl leading-7 text-gray-600">
            This tool was made by Cristian Gutiérrez as part of its Final Bachelors Thesis @ <a href="http://www.cvc.uab.es/" target="_blank" className="font-semibold text-black">Computer Vision Center</a> at UAB. You can always open an issue into our <a href="https://github.com/ggcr/open-EO-hub" target="_blank" className="font-semibold text-indigo-600 hover:text-indigo-500">GitHub Repository</a> or send a mail to <a href="mailto:ggcristian@icloud.com" target="_blank" className="font-semibold text-indigo-600 hover:text-indigo-500">ggcristian@icloud.com</a> and I'll get back to you as soon as we can.
          </p>
          <div className="mt-20">
            <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:grid-cols-3 lg:gap-x-10">
              {faqs.map((faq) => (
                <div key={faq.id}>
                  <dt className="text-xl font-semibold leading-7 text-gray-900">{faq.question}</dt>
                  <dd className="mt-2 text-lg leading-7 text-gray-600">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
          <h2 className="text-3xl font-bold leading-10 mt-32 tracking-tight text-gray-800 mb-0">App Architecture</h2>
        </div>
        <div className="flex justify-center">
            <img src="Architecture.svg" className="w-4/6" alt="architcture of the app" />
        </div>
      </div>
    )
  }