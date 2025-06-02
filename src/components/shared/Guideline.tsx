'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

const steps = [
  'Welcome to the dashboard! Here’s how to get started.',
  'You can submit new applications using the “New Application” button.',
  'Check out available courses and terms in the sidebar.',
  'You’re all set! Let’s get started!'
];

export default function Guideline({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {}}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()} // disables outside click
        onEscapeKeyDown={(e) => e.preventDefault()}   // disables ESC key
      >
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Guidelines</DialogTitle>
           
          </div>
        </DialogHeader>

        <div className="text-gray-700 min-h-[100px] py-4">{steps[step]}</div>

        <DialogFooter>
          <Button onClick={handleNext} className='bg-watney text-white hover:bg-watney/90'>
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
