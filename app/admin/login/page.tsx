import AdminLoginForm from "./AdminLoginForm";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
