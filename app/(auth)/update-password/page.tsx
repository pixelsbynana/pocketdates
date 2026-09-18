import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Make it something memorable, just like the two of you.
        </p>
      </div>

      <UpdatePasswordForm />
    </div>
  );
}
