const LoadingAnimation = () => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95">
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle className="circle circle-1" cx="60" cy="40" r="12" />
        <circle className="circle circle-2" cx="85" cy="80" r="12" />
        <circle className="circle circle-3" cx="35" cy="80" r="12" />
      </svg>
    </div>
  );
}

export default LoadingAnimation;