import { createSignal, createResource, Show } from "solid-js";
import type { FinishRegisterFlattenedErrors } from "../../../pages/api/auth/finish-register";
import { FieldError } from "./FieldError";
import { FormError } from "./FormError";
import "./form.styles.css";
import { Button } from "../ui/Btn";

async function finishRegister(formData: FormData) {
  const response = await fetch("/api/auth/finish-register", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    return data;
  }

  window.location.href = "/login";
}

export function UserInfoForm() {
  const [formData, setFormData] = createSignal<FormData>();
  const [formErrors] = createResource<FinishRegisterFlattenedErrors, FormData>(
    formData,
    finishRegister,
  );

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFormData(new FormData(e.currentTarget as HTMLFormElement));
  }

  return (
    <form method="post" class="form" onSubmit={onSubmit}>
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          required
          aria-invalid={formErrors()?.fieldErrors?.name ? "true" : "false"}
          aria-describedby="name-error"
        />
        <Show when={formErrors()?.fieldErrors?.name}>
          <FieldError
            error={formErrors()?.fieldErrors?.name![0] as string}
            id="name-error"
          />
        </Show>
      </div>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          required
          aria-invalid={formErrors()?.fieldErrors?.username ? "true" : "false"}
          aria-describedby="username-error"
        />
        <Show when={formErrors()?.fieldErrors?.username}>
          <FieldError
            id="username-error"
            error={formErrors()?.fieldErrors?.username![0] as string}
          />
        </Show>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          required
          aria-invalid={formErrors()?.fieldErrors?.password ? "true" : "false"}
          aria-describedby="password-error"
        />
        <Show when={formErrors()?.fieldErrors?.password}>
          <FieldError
            id="password-error"
            error={formErrors()?.fieldErrors?.password![0] as string}
          />
        </Show>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          aria-invalid={
            formErrors()?.fieldErrors?.confirmPassword ? "true" : "false"
          }
          aria-describedby="confirmPassword-error"
          required
        />
        <Show when={formErrors()?.fieldErrors?.confirmPassword}>
          <FieldError
            id="confirmPassword-error"
            error={formErrors()?.fieldErrors?.confirmPassword![0] as string}
          />
        </Show>
      </div>
      <Show when={formErrors()?.formErrors?.length}>
        <FormError error={formErrors()?.formErrors[0] as string} />
      </Show>
      <Button text="Submit" />
    </form>
  );
}
