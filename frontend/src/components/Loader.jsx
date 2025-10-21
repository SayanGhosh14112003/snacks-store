export default function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(254,243,226)] px-4">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Spinner */}
        <div className="w-16 h-16 border-4 border-t-[rgb(221,3,3)] border-b-[rgb(221,3,3)] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
        <p className="text-[rgb(221,3,3)] font-bold text-xl animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
