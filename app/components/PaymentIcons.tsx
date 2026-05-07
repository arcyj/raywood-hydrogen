const PAYMENT_METHODS = [
  {src: '/images/payment/amex.svg', alt: 'American Express'},
  {src: '/images/payment/apple-pay.svg', alt: 'Apple Pay'},
  {src: '/images/payment/google-pay.svg', alt: 'Google Pay'},
  {src: '/images/payment/klarna.svg', alt: 'Klarna'},
  {src: '/images/payment/maestro.svg', alt: 'Maestro'},
  {src: '/images/payment/mastercard.svg', alt: 'Mastercard'},
  {src: '/images/payment/paypal.svg', alt: 'PayPal'},
  {src: '/images/payment/shop-pay.svg', alt: 'Shop Pay'},
  {src: '/images/payment/visa.svg', alt: 'Visa'},
] as const;

export function PaymentIcons({className}: {className?: string}) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className ?? ''}`} role="list">
      {PAYMENT_METHODS.map(({src, alt}) => (
        <li key={src}>
          <img src={src} alt={alt} width={38} height={24} loading="lazy" />
        </li>
      ))}
    </ul>
  );
}
