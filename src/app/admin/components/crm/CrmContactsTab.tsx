"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../../convex/_generated/dataModel";
import { Loading, EmptyState, Th } from "../shared";
import { ScoreBadge, formatRelative } from "./shared";
import { ContactDetailPanel } from "./ContactDetailPanel";

const PAGE_SIZE = 100;

export function CrmContactsTab() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<Id<"contacts"> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadedPages, setLoadedPages] = useState<Doc<"contacts">[][]>([]);

  const result = useQuery(api.crm.getContacts, {
    search: search || undefined,
    source: sourceFilter || undefined,
    tag: tagFilter || undefined,
    limit: PAGE_SIZE,
    cursor,
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCursor(undefined);
    setLoadedPages([]);
  }, [search, sourceFilter, tagFilter]);

  // Append loaded pages when new results arrive for a cursor
  useEffect(() => {
    if (!result) return;
    if (cursor === undefined) {
      // First page — replace
      setLoadedPages([result.contacts]);
    } else {
      // Subsequent page — append if not already added
      setLoadedPages((prev) => {
        const lastPage = prev[prev.length - 1];
        if (lastPage?.[0]?._id === result.contacts[0]?._id) return prev;
        return [...prev, result.contacts];
      });
    }
  }, [result, cursor]);

  const contacts = loadedPages.flat();
  const nextCursor = result?.nextCursor ?? null;

  const handleLoadMore = useCallback(() => {
    if (nextCursor) {
      setCursor(nextCursor);
    }
  }, [nextCursor]);

  const createContact = useMutation(api.crm.createContact);

  // New contact form state
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newPhone, setNewPhone] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createContact({
      email: newEmail,
      firstName: newFirstName,
      lastName: newLastName || undefined,
      company: newCompany || undefined,
      phone: newPhone || undefined,
      source: "manual",
    });
    setShowCreateForm(false);
    setNewEmail("");
    setNewFirstName("");
    setNewLastName("");
    setNewCompany("");
    setNewPhone("");
  }

  if (result === undefined) return <Loading />;

  // Collect unique tags for filter dropdown
  const allTags = [...new Set(contacts.flatMap((c) => c.tags))].sort();
  const sources = ["contact_form", "checkout", "purchase", "registration", "manual", "import", "referral"];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Zoek op naam, email of bedrijf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent w-[280px]"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
        >
          <option value="">Alle bronnen</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
          >
            <option value="">Alle tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
        <div className="flex-1" />
        <span className="text-[12px] text-ink/40">{contacts.length} contacten</span>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
        >
          + Nieuw contact
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="border border-rule rounded-[2px] p-5 space-y-3">
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-2">Nieuw contact</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <input type="email" placeholder="Email *" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" required />
            <input type="text" placeholder="Voornaam *" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" required />
            <input type="text" placeholder="Achternaam" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" />
            <input type="text" placeholder="Bedrijf" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 text-[12px] text-ink/50 cursor-pointer">Annuleren</button>
            <button type="submit" className="px-5 py-1.5 text-[12px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer">Aanmaken</button>
          </div>
        </form>
      )}

      {/* Contact table */}
      {contacts.length === 0 ? (
        <EmptyState text="Nog geen contacten" />
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-rule">
              <tr>
                <Th>Contact</Th>
                <Th>Bedrijf</Th>
                <Th>Bron</Th>
                <Th>Tags</Th>
                <Th>Scores</Th>
                <Th>Laatste activiteit</Th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact._id}
                  onClick={() => setSelectedContactId(contact._id)}
                  className="border-b border-rule last:border-b-0 hover:bg-warm/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-[11px] text-ink/40">{contact.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink/60">
                    {contact.company ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-ink/50">
                      {contact.source.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-warm rounded-[2px] text-ink/60">
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 3 && (
                        <span className="text-[10px] text-ink/30">+{contact.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <ScoreBadge label="I" score={contact.intentScore} type="intent" />
                      <ScoreBadge label="E" score={contact.engagementScore} type="engagement" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink/40">
                    {formatRelative(contact.lastActivityAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load more */}
      {nextCursor && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            className="px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase bg-warm hover:bg-warm/70 rounded-[2px] transition-colors cursor-pointer"
          >
            Meer laden
          </button>
        </div>
      )}

      {/* Contact detail panel */}
      {selectedContactId && (
        <ContactDetailPanel
          contactId={selectedContactId}
          onClose={() => setSelectedContactId(null)}
        />
      )}
    </div>
  );
}
