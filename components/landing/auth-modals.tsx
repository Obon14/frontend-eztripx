"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useLanding } from "@/components/landing/language-provider";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModals() {
  const {
    authModal,
    closeAuth,
    switchToLogin,
    switchToRegister,
    refreshCurrentUser,
    t,
  } = useLanding();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setLoading(false);
  }

  function handleClose() {
    resetForm();
    closeAuth();
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError(t.auth.validationRequired);
      setSuccess("");
      return;
    }
    if (!emailRegex.test(email)) {
      setError(t.auth.validationEmail);
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, scope: "user" }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(
          data?.message && typeof data.message === "string"
            ? data.message
            : t.auth.networkError,
        );
        return;
      }
      setSuccess(t.auth.loginSuccess);
      resetForm();
      await refreshCurrentUser();
      closeAuth();
    } catch {
      setError(t.auth.networkError);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError(t.auth.validationRequired);
      setSuccess("");
      return;
    }
    if (!emailRegex.test(email)) {
      setError(t.auth.validationEmail);
      setSuccess("");
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.validationPasswordMatch);
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(
          data?.message && typeof data.message === "string"
            ? data.message
            : t.auth.networkError,
        );
        return;
      }
      setSuccess(t.auth.registerSuccess);
      resetForm();
      switchToLogin();
    } catch {
      setError(t.auth.networkError);
    } finally {
      setLoading(false);
    }
  }

  const isLogin = authModal === "login";
  const isRegister = authModal === "register";

  return (
    <>
      <Modal
        open={isLogin}
        title={t.auth.loginTitle}
        description={t.auth.loginDesc}
        onClose={handleClose}
      >
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          {error ? <Alert variant="error">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}
          <FormField label={t.auth.email}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </FormField>
          <FormField label={t.auth.password}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={loading}>
            {t.auth.submitLogin}
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            {t.auth.noAccount}{" "}
            <button
              type="button"
              className="font-semibold text-landing-orange hover:underline"
              onClick={() => {
                setError("");
                setSuccess("");
                switchToRegister();
              }}
            >
              {t.auth.switchRegister}
            </button>
          </p>
        </form>
      </Modal>

      <Modal
        open={isRegister}
        title={t.auth.registerTitle}
        description={t.auth.registerDesc}
        onClose={handleClose}
      >
        <form className="space-y-4" onSubmit={handleRegisterSubmit}>
          {error ? <Alert variant="error">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}
          <FormField label={t.auth.name}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
            />
          </FormField>
          <FormField label={t.auth.email}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </FormField>
          <FormField label={t.auth.password}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label={t.auth.confirmPassword}>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={loading}>
            {t.auth.submitRegister}
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            {t.auth.hasAccount}{" "}
            <button
              type="button"
              className="font-semibold text-landing-orange hover:underline"
              onClick={() => {
                setError("");
                setSuccess("");
                switchToLogin();
              }}
            >
              {t.auth.switchLogin}
            </button>
          </p>
        </form>
      </Modal>
    </>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
