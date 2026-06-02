"use client";

import { Button } from "@/components/ui/button";

export function Modal({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 sm:items-center sm:p-4">
      <div className="w-full max-w-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="self-end sm:self-start"
          >
            Tutup
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
