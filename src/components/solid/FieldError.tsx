import "./FieldError.css";

interface Props {
  error: string;
}

export function FieldError(props: Props) {
  return <span class="error">{props.error}</span>;
}
