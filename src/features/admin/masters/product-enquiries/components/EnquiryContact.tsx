/** Email and phone as tap-to-contact links. */
export const EnquiryEmail = ({ email }: { email: string }) => (
  <a className="product-enquiries__link product-enquiries__email" href={`mailto:${email}`}>
    {email}
  </a>
);

export const EnquiryPhone = ({ phone }: { phone: string }) => (
  <a className="product-enquiries__link" href={`tel:${phone}`}>
    {phone}
  </a>
);
