import Category from "../components/Category";
import Product from "../components/Product";
import Footer from "../components/Footer";
import '../animation.css'; // import the CSS

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[rgb(254,243,226)] via-[rgb(255,250,240)] to-[rgb(254,243,226)] text-[rgb(60,30,10)] flex flex-col items-center px-6 py-10">

        {/* Hero Text */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gradient-animate">
            Welcome to the Snacks Store!
          </h1>
          <p className="text-lg md:text-xl text-[rgb(60,30,10)]">
            Your one-stop shop for all your snack needs.
          </p>
        </div>

        {/* Category Filter */}
        <Category />
        <Product />
      </div>
      <Footer />
    </>
  );
}