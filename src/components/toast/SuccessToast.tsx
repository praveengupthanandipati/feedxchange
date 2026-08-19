type SuccessToastProps = {
  message: string;
};

const SuccessToast = ({ message }: SuccessToastProps) => {
  if (!message) return null;

  return <div className="category-toast">{message}</div>;
};

export default SuccessToast;