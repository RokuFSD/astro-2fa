import "./form-error.styles.css";

interface Props {
  error: string;
}

export function FormError(props: Props) {
  return (
    <div class="error-container">
      <span class="error-message" aria-live="assertive">
        {props.error}
      </span>
    </div>
  );
}
