import "./field-error.styles.css";

interface Props {
  error: string;
  id: string;
}

export function FieldError(props: Props) {
  return (
    <span class="error" id={props.id}>
      {props.error}
    </span>
  );
}
