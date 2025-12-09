const LoadingSpinner = () => {

  return (
    <div className="fixed right-1/2 bottom-1/2  transform translate-x-1/2 translate-y-1/2 z-[9999]">
      <div className="border-t-transparent border-solid animate-spin rounded-full border-green-500 border-8 h-24 w-24"></div>
    </div>
  );
}

export default LoadingSpinner;