import { createResource, createSignal, Show } from "solid-js";
import "./LoginForm.css";
import type { FlattenedErrors } from "../../pages/api/login";
import { FieldError } from "./FieldError";

async function login(formData: FormData) {
  const response = await fetch("/api/login", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    return data;
  }

  // navigate to home
  window.location.href = "/";
}

export function LoginForm() {
  const [formData, setFormData] = createSignal<FormData>();

  const [loginErrors] = createResource<FlattenedErrors, FormData>(
    formData,
    login,
  );

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFormData(new FormData(e.currentTarget as HTMLFormElement));
  }
  return (
    <form method="post" class="form" onSubmit={onSubmit}>
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" name="username" id="username" required />
        <Show when={loginErrors()?.fieldErrors?.username}>
          <FieldError
            error={loginErrors()?.fieldErrors?.username![0] as string}
          />
        </Show>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" name="password" id="password" required />
        <Show when={loginErrors()?.fieldErrors?.password}>
          <FieldError
            error={loginErrors()?.fieldErrors?.password![0] as string}
          />
        </Show>
      </div>
      <button type="submit" class="btn">
        Login
      </button>
    </form>
  );
}
