import { createResource, createSignal, Show, createEffect } from "solid-js";
import "./form.styles.css";
import type { LoginFlattenedErrors } from "../../../pages/api/auth/login";
import { FieldError } from "./FieldError";
import { FormError } from "./FormError";
import { Button } from "../ui/Btn";

async function login(formData: FormData) {
  const response = await fetch("/api/login", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    return data;
  }

  window.location.href = "/";
}

export function LoginForm() {
  const [formData, setFormData] = createSignal<FormData>();

  const [loginErrors] = createResource<LoginFlattenedErrors, FormData>(
    formData,
    login,
  );

  let usernameInput: HTMLInputElement;
  let passwordInput: HTMLInputElement;

  createEffect(() => {
    if (loginErrors()?.formErrors.length) {
      usernameInput.focus();
      return;
    }
    if (loginErrors()?.fieldErrors?.password) {
      passwordInput.focus();
    }
    if (loginErrors()?.fieldErrors?.username) {
      usernameInput.focus();
    }
  });

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFormData(new FormData(e.currentTarget as HTMLFormElement));
  }
  return (
    <form method="post" class="form" onSubmit={onSubmit}>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          ref={(el) => (usernameInput = el)}
          type="text"
          name="username"
          id="username"
          required
          aria-invalid={loginErrors()?.fieldErrors?.username ? "true" : "false"}
          aria-describedby="username-error"
        />
        <Show when={loginErrors()?.fieldErrors?.username}>
          <FieldError
            id="username-error"
            error={loginErrors()?.fieldErrors?.username![0] as string}
          />
        </Show>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          ref={(el) => (passwordInput = el)}
          type="password"
          name="password"
          id="password"
          required
          aria-invalid={loginErrors()?.fieldErrors?.password ? "true" : "false"}
          aria-describedby="password-error"
        />
        <Show when={loginErrors()?.fieldErrors?.password}>
          <FieldError
            id="password-error"
            error={loginErrors()?.fieldErrors?.password![0] as string}
          />
        </Show>
      </div>
      <Show when={loginErrors()?.formErrors?.length}>
        <FormError error={loginErrors()?.formErrors[0] as string} />
      </Show>
      <Button text="Login" />
    </form>
  );
}
