import { createResource, createSignal, Show } from "solid-js";
import "./form.styles.css";
import type { VerificationFlattenedErros } from "../../../pages/api/verification/verify-email";
import { FieldError } from "./FieldError";
import { FormError } from "./FormError";
import { Button } from "../ui/Btn";

async function verifyEmail(formData: FormData) {
  const response = await fetch("/api/verify-email", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok) {
    return data;
  }

  window.location.href = "/finish-register";
}

export function VerifyForm() {
  const [formData, setFormData] = createSignal<FormData>();

  const [verificationErrors] = createResource<
    VerificationFlattenedErros,
    FormData
  >(formData, verifyEmail);

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFormData(new FormData(e.currentTarget as HTMLFormElement));
  }
  return (
    <form method="post" class="form" onSubmit={onSubmit}>
      <div class="form-group">
        <label for="otpCode">Verfication Code</label>
        <input
          type="text"
          name="otpCode"
          id="otpCode"
          required
          aria-invalid={
            verificationErrors()?.fieldErrors?.otpCode ? "true" : "false"
          }
          aria-describedby="otpCode-error"
        />
        <Show when={verificationErrors()?.fieldErrors?.otpCode}>
          <FieldError
            id="otpCode-error"
            error={verificationErrors()?.fieldErrors?.otpCode![0] as string}
          />
        </Show>
      </div>
      <Show when={verificationErrors()?.formErrors?.length}>
        <FormError error={verificationErrors()?.formErrors[0] as string} />
      </Show>
      <Button text="Verify" />
    </form>
  );
}
