import { useState } from "react";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
  title: string;
}

export const ClientModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  title,
}: ClientModalProps) => {
  const [name, setName] = useState(initialName);
  const [lastProps, setLastProps] = useState({ initialName, isOpen });

  if (lastProps.initialName !== initialName || lastProps.isOpen !== isOpen) {
    setLastProps({ initialName, isOpen });
    if (isOpen) setName(initialName);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-background border border-black/10 dark:border-white/10 p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="client-name" className="text-sm font-medium text-foreground/70">
              Nombre del Cliente
            </label>
            <input
              id="client-name"
              type="text"
              placeholder="Ej: Peluquería Pelu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-black/15 dark:border-white/20 rounded-full px-4 py-2.5 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/50 text-sm"
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-black/15 dark:border-white/20 text-foreground font-medium text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 h-11 rounded-full bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

