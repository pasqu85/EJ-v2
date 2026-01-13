"use client";

import { useState } from "react";
import { PasswordInput } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Button, Code, Text } from '@mantine/core';


type UserRole = "worker" | "employer";

export default function Login({
  onLogin,
}: {
  onLogin: (role: UserRole) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("worker");


  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },

    // functions will be used to validate values at corresponding key
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length > 0 ? null : 'Password cannot be empty'),
    },
  });

  const submit = () => {
    if (!form.isValid) {
      return;
    }

    // Here we don't validate server-side; just call the callback with the role
    onLogin(role);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow space-y-4">
        <header className="bg-white py-2 text-center top-0 z-10">
        <div className="sm:flex-row justify-between items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold pointer">
              extra<span className="text-emerald-500">Job</span>
            </h1>
            <p className="text-gray-600 text-sm">
              Trova o offri lavoro extra, quando serve.
            </p>
          </div>
        </div>
        </header>

      <form onSubmit={form.onSubmit(submit)} className="space-y-3">

        <TextInput mt="md"
          placeholder="Email"
          key={form.key('email')}
          {...form.getInputProps('email')}
          className="w-full p-3 rounded-xl border" />

        <PasswordInput
          {...form.getInputProps('password')}
          key={form.key('password')}
          className="w-full p-3 rounded-xl border"
          placeholder="Password"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole("worker")}
            className={`flex-1 py-2 rounded-xl font-semibold border ${
              role === "worker" ? "bg-emerald-500 text-white" : "bg-white"
            }`}
          >
            👷 Cerco lavoro
          </button>

          <button
            type="button"
            onClick={() => setRole("employer")}
            className={`flex-1 py-2 rounded-xl font-semibold border ${
              role === "employer" ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            🏢 Cerco personale
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold"
        >
          Accedi
        </button>

        <div className="text-sm text-gray-500 text-center">
          Oppure prova: 
          <button
            type="button"
            onClick={() => {
              setEmail("demo@example.com");
              setPassword("demo");
              setRole("worker");
              onLogin("worker");
            }}
            className="underline ml-1"
          >
            accesso rapido lavoratore
          </button>
          <span> · </span>
          <button
            type="button"
            onClick={() => {
              setEmail("demo@company.com");
              setPassword("demo");
              setRole("employer");
              onLogin("employer");
            }}
            className="underline"
          >
            accesso rapido datore
          </button>
        </div>
      </form>
    </div>
  );
}
