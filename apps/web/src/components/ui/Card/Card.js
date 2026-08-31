'use client';

import styles from './Card.module.css';
import { clsx } from 'clsx';

export default function Card({ 
  children, 
  variant = 'default',
  size = 'medium',
  padding = 'default',
  hover = false,
  shadow = 'sm',
  rounded = 'default',
  clickable = false,
  onClick,
  className,
  as = 'div',
  ...props 
}) {
  const Component = clickable ? 'button' : as;
  
  const componentProps = clickable 
    ? { onClick, type: 'button', ...props }
    : onClick 
      ? { onClick, ...props }
      : props;

  return (
    <Component
      className={clsx(
        styles.card,
        styles[variant],
        styles[size],
        styles[`padding-${padding}`],
        styles[`shadow-${shadow}`],
        styles[`rounded-${rounded}`],
        {
          [styles.hover]: hover || clickable,
          [styles.clickable]: clickable
        },
        className
      )}
      {...componentProps}
    >
      {children}
    </Component>
  );
}

// Card sub-components for better composition
Card.Header = function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className, ...props }) {
  return (
    <div className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className, ...props }) {
  return (
    <div className={clsx(styles.footer, className)} {...props}>
      {children}
    </div>
  );
};

Card.Image = function CardImage({ src, alt, className, objectFit = 'cover', ...props }) {
  return (
    <div className={clsx(styles.imageContainer, className)}>
      <img 
        src={src} 
        alt={alt}
        className={clsx(styles.image, styles[`fit-${objectFit}`])}
        {...props}
      />
    </div>
  );
};

Card.Title = function CardTitle({ children, className, as = 'h3', ...props }) {
  const Component = as;
  return (
    <Component className={clsx(styles.title, className)} {...props}>
      {children}
    </Component>
  );
};

Card.Description = function CardDescription({ children, className, ...props }) {
  return (
    <p className={clsx(styles.description, className)} {...props}>
      {children}
    </p>
  );
};

Card.Actions = function CardActions({ children, className, align = 'start', ...props }) {
  return (
    <div className={clsx(styles.actions, styles[`align-${align}`], className)} {...props}>
      {children}
    </div>
  );
};