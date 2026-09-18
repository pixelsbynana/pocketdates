"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { SelectPillGrid } from "@/components/onboarding/select-pill-grid";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { DATE_STYLE_OPTIONS, INTEREST_OPTIONS } from "@/lib/constants";
import type { OnboardingData } from "@/types/domain";

const TOTAL_STEPS = 4;

export function OnboardingWizard({ initial }: { initial: OnboardingData }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initial);
  const [pending, startTransition] = useTransition();

  function next() {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else finish();
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function finish() {
    startTransition(() => {
      completeOnboarding(data);
    });
  }

  const stepTitle = [
    "What should we call you?",
    "Who are you doing life with?",
    "What do you two usually enjoy?",
    "What kind of dates do you like?",
  ][step];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
        <div className="flex-1">
          <ProgressDots total={TOTAL_STEPS} current={step} />
        </div>
        <div className="w-9" />
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-center font-serif text-2xl leading-snug text-foreground">
              {stepTitle}
            </h1>

            {step === 0 && (
              <Input
                autoFocus
                placeholder="Your first name"
                value={data.firstName}
                onChange={(e) => setData({ ...data, firstName: e.target.value })}
                className="h-14 rounded-2xl text-center text-lg"
              />
            )}

            {step === 1 && (
              <Input
                autoFocus
                placeholder="Partner's name"
                value={data.partnerName}
                onChange={(e) => setData({ ...data, partnerName: e.target.value })}
                className="h-14 rounded-2xl text-center text-lg"
              />
            )}

            {step === 2 && (
              <SelectPillGrid
                options={INTEREST_OPTIONS}
                selected={data.interests}
                onChange={(values) =>
                  setData({ ...data, interests: values as OnboardingData["interests"] })
                }
              />
            )}

            {step === 3 && (
              <SelectPillGrid
                options={DATE_STYLE_OPTIONS}
                selected={data.dateStyles}
                onChange={(values) =>
                  setData({ ...data, dateStyles: values as OnboardingData["dateStyles"] })
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-2 pb-safe">
        <Button
          size="lg"
          className="w-full rounded-full"
          onClick={next}
          disabled={pending}
        >
          {step === TOTAL_STEPS - 1 ? (pending ? "Saving…" : "Finish") : "Continue"}
        </Button>
        {step < TOTAL_STEPS - 1 && (
          <Button size="lg" variant="ghost" className="w-full rounded-full" onClick={next}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
