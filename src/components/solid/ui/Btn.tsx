import "./Btn.css";

interface Props {
  text: string;
}

export function Button(props: Props) {
  return (
    <button type="submit" class="btn">
      {props.text}
    </button>
  );
}
