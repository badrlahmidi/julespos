"use client";

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditStore } from '../../store/useAuditStore';
import { hasPermission } from '../../lib/permissions';
import { PinPad } from './PinPad';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import type { Permission } from '../../lib/permissions';

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
  onAuthorizedAction: () => void;
  actionDetails?: string; // Information for the audit log
  orderId?: string; // Optional context for audit
}

export const RequirePermission = ({
  permission,
  children,
  onAuthorizedAction,
  actionDetails,
  orderId
}: RequirePermissionProps) => {
  const currentUser = useAuthStore(state => state.currentUser);
  const verifyPin = useAuthStore(state => state.verifyPin);
  const logAction = useAuditStore(state => state.logAction);

  const [showOverride, setShowOverride] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActionRequest = () => {
    if (hasPermission(currentUser?.role, permission)) {
      // User has permission, proceed immediately
      executeAction(currentUser?.id || 'unknown', currentUser?.name || 'Unknown');
    } else {
      // User lacks permission, request override
      setShowOverride(true);
      setError(null);
    }
  };

  const handleOverridePin = (pin: string) => {
    // Attempt to verify PIN, ensuring the user has the required permission
    const authorizedUser = useAuthStore.getState().users.find(u => {
       return u.pinHash === btoa(pin).substring(0, 10) && hasPermission(u.role, permission);
    });

    if (authorizedUser) {
      setShowOverride(false);
      executeAction(authorizedUser.id, authorizedUser.name);
    } else {
      setError("PIN invalide ou droits insuffisants.");
    }
  };

  const executeAction = (userId: string, userName: string) => {
    // Map permissions to actions for the audit log (simple mapping for prototype)
    let actionType: any = 'VOID_ORDER'; // default fallback
    if (permission === 'CAN_VOID_ITEM') actionType = 'VOID_ITEM';
    else if (permission === 'CAN_APPLY_DISCOUNT') actionType = 'DISCOUNT_APPLIED';
    // Add more mappings as needed

    const logData: any = {
      userId,
      userName,
      action: actionType,
      details: actionDetails || `Permission ${permission} accordée`,
    };
    if (orderId) logData.orderId = orderId;

    logAction(logData);

    onAuthorizedAction();
  };

  return (
    <>
      <div onClickCapture={(e) => {
        if (!hasPermission(currentUser?.role, permission)) {
          e.stopPropagation();
          e.preventDefault();
          setShowOverride(true);
          setError(null);
        }
      }}>
        <div onClick={() => {
          if (hasPermission(currentUser?.role, permission)) {
            executeAction(currentUser!.id, currentUser!.name);
          }
        }} className={!hasPermission(currentUser?.role, permission) ? 'opacity-80 relative' : ''}>
           {/* Transparent overlay to capture clicks if no permission */}
           {!hasPermission(currentUser?.role, permission) && (
             <div className="absolute inset-0 z-10 cursor-not-allowed" />
           )}
           {children}
        </div>
      </div>

      <AnimatePresence>
        {showOverride && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowOverride(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-pos-dark rounded-2xl shadow-2xl p-8 border border-pos-card"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                  <ShieldAlert size={32} />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">Autorisation Requise</h3>
                <p className="text-pos-text-muted text-center text-sm">
                  Votre rôle ne permet pas cette action. Un responsable doit saisir son code PIN.
                </p>
              </div>

              <PinPad
                onPinComplete={handleOverridePin}
                onCancel={() => setShowOverride(false)}
                error={error}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
