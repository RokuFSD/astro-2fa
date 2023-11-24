import { createResource, createSignal, Show } from "solid-js";
import "./form.styles.css";
import type { RegisterFlattenedErrors } from "../../../pages/api/auth/register";
import { FieldError } from "./FieldError";
import { FormError } from "./FormError";
import { Button } from "../ui/Btn";

async function register(formData: FormData) {
  const response = await fetch("/api/register", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    return data;
  }

  window.location.href = "/verify";
}

export function RegisterForm() {
  const [formData, setFormData] = createSignal<FormData>();

  const [registerErrors] = createResource<RegisterFlattenedErrors, FormData>(
    formData,
    register,
  );

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFormData(new FormData(e.currentTarget as HTMLFormElement));
  }
  return (
    <form method="post" class="form" onSubmit={onSubmit}>
      <div class="form-group">
        <label for="username">Email</label>
        <input
          type="text"
          name="email"
          id="email"
          aria-invalid={registerErrors()?.fieldErrors?.email ? "true" : "false"}
          aria-describedby="email-error"
          required
        />
        <Show when={registerErrors()?.fieldErrors?.email}>
          <FieldError
            id="email-error"
            error={registerErrors()?.fieldErrors?.email![0] as string}
          />
        </Show>
      </div>
      <Show when={registerErrors()?.formErrors?.length}>
        <FormError error={registerErrors()?.formErrors[0] as string} />
      </Show>
      <Button text="Continue" />
    </form>
  );
}
