import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

/**
 * A dialog that displays when a user attempts an action they don't have permission for
 * 
 * @param {Object} props 
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.setOpen - Function to set the open state
 * @param {string} props.action - The action that was attempted (e.g. "delete student")
 * @param {string} props.resource - The resource that was being accessed (e.g. "student")
 */
export function PermissionDeniedDialog({ open, setOpen, action, resource }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
            <ShieldAlert className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center">Permission Denied</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You do not have permission to {action || 'perform this action'} 
            {resource ? ` on this ${resource}` : ''}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button 
            variant="secondary" 
            onClick={() => setOpen(false)}
            className="mt-2"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PermissionDeniedDialog;
