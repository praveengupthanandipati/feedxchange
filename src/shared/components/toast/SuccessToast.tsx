import "./SuccessToast.scss";

type SuccessToastProps = {
  message: string;
};

const SuccessToast = ({ message }: SuccessToastProps) => {
  if (!message) return null;

  return (
    <div className="category-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default SuccessToast;