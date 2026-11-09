import { useState } from "react";
import { Flame, Eye, EyeOff, LogIn } from "lucide-react";
import { API_URL, guardarToken } from "../auth.js";

export default function Login({ onEntrar }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: usuario.trim(), password }),
      });
      if (res.status === 401) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }
      if (!res.ok) {
        setError("El servidor no tiene el acceso configurado. Revisa las variables en Render.");
        return;
      }
      const { token } = await res.json();
      guardarToken(token);
      onEntrar(token);
    } catch (err) {
      setError("No se pudo conectar con la API. Si estuvo inactiva, espera un minuto e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "w-full border border-char-600 bg-char-700 px-3 py-2 text-sm text-parchment-100 outline-none transition-colors placeholder:text-parchment-400/60 focus:border-moss-400";

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
      <div className="panel-corners w-full max-w-sm border border-char-600 bg-char-800 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-char-600 bg-char-900 text-ember-500">
            <Flame size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-parchment-100">
              Centinela
            </h1>
            <p className="text-xs text-parchment-400">Acceso al panel de monitoreo</p>
          </div>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <div>
            <label htmlFor="usuario" className="mb-1.5 block text-xs text-parchment-400">
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className={campo}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs text-parchment-400">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${campo} pr-10`}
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-parchment-400 hover:text-parchment-100"
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="border border-ember-500 bg-ember-600/10 px-3 py-2 text-xs text-ember-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex items-center justify-center gap-2 border border-moss-400 px-4 py-2 text-sm text-moss-400 transition-colors hover:bg-moss-400/10 disabled:cursor-wait disabled:opacity-60"
          >
            <LogIn size={15} strokeWidth={1.75} />
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
