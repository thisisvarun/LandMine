const Loading = ({ fullScreen = false }) => (
    <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
  
  export default Loading;