/** A neutral spinner shown while a screen's code is downloading. */
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center py-5" role="status" aria-label="Loading">
    <div className="spinner-border text-secondary" aria-hidden />
  </div>
);

export default PageLoader;
