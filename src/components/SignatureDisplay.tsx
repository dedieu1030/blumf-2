
import React from 'react';
import { SignatureData } from "@/types/invoice";
import { cn } from "@/lib/utils";

interface SignatureDisplayProps {
  signatureData?: SignatureData;
  className?: string;
  style?: React.CSSProperties;
}

export function SignatureDisplay({ signatureData, className = "", style = {} }: SignatureDisplayProps) {
  if (!signatureData) return null;
  
  if (signatureData.type === 'drawn' && signatureData.dataUrl) {
    return (
      <div className={cn("flex flex-col items-center", className)} style={style}>
        <img 
          src={signatureData.dataUrl} 
          alt="Signature" 
          className="max-h-[60px] max-w-[200px] object-contain"
        />
        {signatureData.name && (
          <div className="text-sm text-muted-foreground mt-1">{signatureData.name}</div>
        )}
      </div>
    );
  }
  
  if (signatureData.type === 'initials' && signatureData.initials) {
    return (
      <div className={cn("flex flex-col items-center", className)} style={style}>
        <div className="font-bold text-2xl font-signature">{signatureData.initials}</div>
        {signatureData.name && (
          <div className="text-sm text-muted-foreground mt-1">{signatureData.name}</div>
        )}
      </div>
    );
  }
  
  // Affichage par défaut pour les anciennes données de signature
  return (
    <div className={cn("flex flex-col items-center", className)} style={style}>
      <div className="border p-2 w-[200px] h-[60px] flex items-center justify-center text-gray-400">
        Signature
      </div>
    </div>
  );
}
