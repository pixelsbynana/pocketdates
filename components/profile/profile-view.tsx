"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download, Heart, LogOut, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MemoryStatsBanner } from "@/components/memories/memory-stats";
import { PartnerCard } from "@/components/profile/partner-card";
import { signOut } from "@/lib/actions/auth";
import { updateProfileDetails, deleteAccount } from "@/lib/actions/profile";
import { DATE_STYLE_OPTIONS, INTEREST_OPTIONS } from "@/lib/constants";
import type { MemoryStats } from "@/services/memories";
import type { Interest, DateStyle } from "@/types/database";

interface ProfileViewProps {
  email: string;
  firstName: string | null;
  partnerName: string | null;
  interests: Interest[];
  dateStyles: DateStyle[];
  favoritesCount: number;
  stats: MemoryStats;
  partnerFirstName: string | null;
  hasPendingInvite: boolean;
}

export function ProfileView({
  email,
  firstName,
  partnerName,
  interests,
  dateStyles,
  favoritesCount,
  stats,
  partnerFirstName,
  hasPendingInvite,
}: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  function handleSave(formData: FormData) {
    startSaving(async () => {
      const result = await updateProfileDetails(formData);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Profile updated");
        setEditing(false);
      }
    });
  }

  const initials = [firstName, partnerName]
    .filter(Boolean)
    .map((n) => n![0]?.toUpperCase())
    .join("") || "💛";

  return (
    <div className="space-y-6 pb-10">
      <h1 className="font-serif text-2xl text-foreground">Profile</h1>

      <div className="rounded-3xl border border-border/70 bg-card p-5">
        {editing ? (
          <form action={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Your name</Label>
              <Input id="firstName" name="firstName" defaultValue={firstName ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partnerName">Partner&apos;s name</Label>
              <Input id="partnerName" name="partnerName" defaultValue={partnerName ?? ""} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 rounded-full" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-xl text-accent-foreground">
              {initials}
            </div>
            <div className="flex-1">
              <p className="font-serif text-xl text-foreground">
                {firstName || "You"} {partnerName ? `& ${partnerName}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <PartnerCard partnerFirstName={partnerFirstName} hasPendingInvite={hasPendingInvite} />

      <MemoryStatsBanner stats={stats} />

      <div className="rounded-3xl border border-border/70 bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">What we enjoy</p>
          <Link href="/onboarding" className="text-sm font-medium text-primary">
            Edit
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {interests.length === 0 && dateStyles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing set yet — tell us what you two enjoy.
            </p>
          ) : (
            <>
              {interests.map((i) => {
                const opt = INTEREST_OPTIONS.find((o) => o.value === i);
                return (
                  <Badge key={i} variant="secondary" className="rounded-full">
                    {opt?.emoji} {opt?.label}
                  </Badge>
                );
              })}
              {dateStyles.map((d) => {
                const opt = DATE_STYLE_OPTIONS.find((o) => o.value === d);
                return (
                  <Badge key={d} variant="secondary" className="rounded-full">
                    {opt?.emoji} {opt?.label}
                  </Badge>
                );
              })}
            </>
          )}
        </div>
      </div>

      <Link
        href="/favorites"
        className="flex items-center justify-between rounded-3xl border border-border/70 bg-card p-5"
      >
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <Heart className="h-4 w-4 text-rose" /> Favourites
        </span>
        <span className="text-sm text-muted-foreground">{favoritesCount} saved</span>
      </Link>

      <div className="space-y-2">
        <a
          href="/api/account/export"
          className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
        >
          <Download className="h-4 w-4" /> Export my data
        </a>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </form>

        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="flex w-full items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete account
        </button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your profile, preferences, memories, and photos.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={() =>
                startDeleting(async () => {
                  const result = await deleteAccount();
                  if (result && "error" in result) toast.error(result.error);
                })
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
