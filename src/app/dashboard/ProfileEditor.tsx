"use client";

import { useState } from "react";

export function ProfileEditor({ email, profile, onSave }: {
  email: string;
  profile: { firstName: string; lastName?: string; phone?: string; company?: string; website?: string; linkedin?: string } | null | undefined;
  onSave: (data: { firstName: string; lastName?: string; phone?: string; company?: string; website?: string; linkedin?: string }) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [company, setCompany] = useState(profile?.company ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [linkedin, setLinkedin] = useState(profile?.linkedin ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const inputClass = "w-full bg-transparent border border-rule px-3 py-2 text-[14px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none rounded-[2px]";

  return (
    <div className="mt-4 border border-rule rounded-[2px] p-6 space-y-4">
      <div>
        <label className="text-[12px] text-ink/40 mb-1 block">E-mail</label>
        <p className="text-[14px] text-ink/60 py-2">{email}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[12px] text-ink/40 mb-1 block">Voornaam</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-[12px] text-ink/40 mb-1 block">Achternaam</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[12px] text-ink/40 mb-1 block">Telefoon</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+31 6 ..." className={inputClass} />
        </div>
        <div>
          <label className="text-[12px] text-ink/40 mb-1 block">Bedrijf</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[12px] text-ink/40 mb-1 block">Website</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
        <div>
          <label className="text-[12px] text-ink/40 mb-1 block">LinkedIn</label>
          <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className={inputClass} />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={async () => {
            setSaving(true);
            await onSave({
              firstName: firstName || "—",
              lastName: lastName || undefined,
              phone: phone || undefined,
              company: company || undefined,
              website: website || undefined,
              linkedin: linkedin || undefined,
            });
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          disabled={saving}
          className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
        {saved && <span className="text-[12px] text-green-600">Opgeslagen</span>}
      </div>
    </div>
  );
}
