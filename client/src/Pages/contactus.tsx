export default function ContactUs() {
    return (
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8">Get in Touch with Us</h1>
          <p className="text-lg mb-6">
            We’re here to help! If you have any questions, suggestions, or feedback, please feel free to reach out to us.
          </p>
          <p className="text-lg mb-6">
            You can email us directly at: 
            <a
              href="mailto:heinrich@ucf.edu"
              className="text-yellow-500 hover:text-yellow-600 font-semibold ml-1"
            >
              heinrich@ucf.edu
            </a>
          </p>
          <p className="text-lg">
            We look forward to hearing from you and will get back to you as soon as possible!
          </p>
        </div>
      </div>
    );
  }
  