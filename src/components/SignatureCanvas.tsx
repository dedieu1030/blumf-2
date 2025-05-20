import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignatureData } from "@/types/invoice";
import { toast } from "sonner";

interface SignatureCanvasProps {
  onSignatureChange: (signatureData: SignatureData | undefined) => void;
  signatureData?: SignatureData;
  userName?: string;
}

export function SignatureCanvas({ onSignatureChange, signatureData, userName = "" }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [signatureType, setSignatureType] = useState<'drawn' | 'initials'>(signatureData?.type || 'drawn');
  const [initials, setInitials] = useState(signatureData?.initials || '');
  const [name, setName] = useState(signatureData?.name || userName);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasInitialized, setCanvasInitialized] = useState(0); // Compteur pour forcer la réinitialisation
  
  // Fonction améliorée pour initialiser le canvas avec la signature
  const initializeCanvas = () => {
    console.log("Tentative d'initialisation du canvas", {
      canvasExists: !!canvasRef.current,
      signatureType,
      timestamp: new Date().toISOString()
    });
    
    if (!canvasRef.current || signatureType !== 'drawn') {
      console.log("Initialisation du canvas annulée - conditions non remplies");
      return;
    }
    
    const canvas = canvasRef.current;
    
    // Nettoyer l'ancienne instance si elle existe
    if (signaturePadRef.current) {
      console.log("Nettoyage de l'instance précédente de SignaturePad");
      signaturePadRef.current.off();
      signaturePadRef.current = null;
    }
    
    // Ajuster la taille du canvas pour qu'il soit responsive
    const parentWidth = canvas.parentElement?.clientWidth || 300;
    canvas.width = parentWidth;
    canvas.height = 200;
    
    // Effacer le contexte manuellement
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Créer l'instance SignaturePad avec des options améliorées
    try {
      console.log("Création d'une nouvelle instance SignaturePad");
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 0.5,
        maxWidth: 2.5,
        velocityFilterWeight: 0.7
      });
      
      // Restaurer la signature existante si disponible
      if (signatureData?.dataUrl && signatureType === 'drawn') {
        try {
          signaturePadRef.current.fromDataURL(signatureData.dataUrl);
          console.log("Signature restaurée avec succès");
        } catch (error) {
          console.error("Erreur lors de la restauration de la signature:", error);
        }
      }
      
      setCanvasReady(true);
      
      console.log("Canvas initialisé avec succès", {
        width: canvas.width,
        height: canvas.height,
        isEmpty: signaturePadRef.current.isEmpty(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation de SignaturePad:", error);
      setCanvasReady(false);
    }
  };
  
  // Configuration et initialisation de SignaturePad au chargement initial
  useEffect(() => {
    console.log("Effet de montage du composant");
    
    // Retarder légèrement l'initialisation pour s'assurer que le DOM est prêt
    const timerId = setTimeout(() => {
      initializeCanvas();
    }, 100);
    
    return () => {
      // Nettoyer le timer et l'instance SignaturePad
      clearTimeout(timerId);
      if (signaturePadRef.current) {
        console.log("Nettoyage de SignaturePad lors du démontage");
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }
      setCanvasReady(false);
    };
  }, []); // Exécuté uniquement au montage/démontage du composant
  
  // Réinitialiser le canvas lors du changement de type de signature ou de l'incrémentation du compteur
  useEffect(() => {
    console.log("Effet de changement de type ou de compteur", { signatureType, canvasInitialized });
    
    if (signatureType === 'drawn') {
      // Retarder légèrement l'initialisation pour s'assurer que le DOM est prêt
      const timerId = setTimeout(() => {
        console.log("Réinitialisation du canvas après changement de type ou compteur");
        initializeCanvas();
      }, 100);
      
      return () => {
        clearTimeout(timerId);
      };
    } else {
      setCanvasReady(false);
    }
  }, [signatureType, canvasInitialized]);
  
  // Fonction pour redimensionner le canvas si la fenêtre change de taille
  useEffect(() => {
    const handleResize = () => {
      console.log("Événement de redimensionnement détecté");
      
      if (canvasRef.current && signaturePadRef.current && signatureType === 'drawn') {
        const canvas = canvasRef.current;
        let data;
        
        try {
          // Sauvegarder les données actuelles de signature
          data = signaturePadRef.current.toData();
          
          // Ajuster la taille du canvas
          const parentWidth = canvas.parentElement?.clientWidth || 300;
          canvas.width = parentWidth;
          canvas.height = 200;
          
          // Effacer le canvas (nécessaire après redimensionnement)
          signaturePadRef.current.clear();
          
          // Restaurer les données seulement si elles existent
          if (data && data.length > 0) {
            signaturePadRef.current.fromData(data);
          }

          console.log("Canvas redimensionné avec succès", { 
            width: canvas.width, 
            height: canvas.height,
            dataPoints: data ? data.length : 0
          });
        } catch (error) {
          console.error("Erreur lors du redimensionnement:", error);
          // Forcer une réinitialisation en cas d'erreur
          setCanvasInitialized(prev => prev + 1);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [signatureType]);
  
  // Update the saveSignature function to match our SignatureData type
  const saveSignature = () => {
    if (signatureType === 'drawn' && signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        toast.error("Veuillez dessiner une signature avant de sauvegarder");
        onSignatureChange(undefined);
        return;
      }
      
      try {
        const dataUrl = signaturePadRef.current.toDataURL('image/png');
        const timestamp = new Date().toISOString();
        
        // Créer l'objet de données de signature
        const newSignatureData: SignatureData = {
          type: 'drawn' as const,
          dataUrl,
          name,
          timestamp,
          points: [], // Initialize with empty points array
          width: canvasRef.current?.width || 300,
          height: canvasRef.current?.height || 200
        };
        
        // Enregistrer dans localStorage pour réutilisation future
        const savedSignatures = JSON.parse(localStorage.getItem('savedSignatures') || '[]');
        savedSignatures.push(newSignatureData);
        localStorage.setItem('savedSignatures', JSON.stringify(savedSignatures));
        
        // Notifier le composant parent
        onSignatureChange(newSignatureData);
        toast.success("Signature sauvegardée");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la signature:", error);
        toast.error("Erreur lors de la sauvegarde de la signature");
      }
    } else if (signatureType === 'initials' && initials.trim()) {
      const timestamp = new Date().toISOString();
      
      // Créer l'objet de données pour les initiales
      const newSignatureData: SignatureData = {
        type: 'initials' as const,
        initials: initials.trim(),
        name,
        timestamp,
        points: [], // Initialize with empty points array
        width: 200,
        height: 100
      };
      
      // Enregistrer dans localStorage pour réutilisation future
      const savedSignatures = JSON.parse(localStorage.getItem('savedSignatures') || '[]');
      savedSignatures.push(newSignatureData);
      localStorage.setItem('savedSignatures', JSON.stringify(savedSignatures));
      
      // Notifier le composant parent
      onSignatureChange(newSignatureData);
      toast.success("Initiales sauvegardées");
    } else {
      toast.error("Aucune signature ou initiales à sauvegarder");
      onSignatureChange(undefined);
    }
  };
  
  // Fonction pour effacer la signature
  const clearSignature = () => {
    if (signatureType === 'drawn' && signaturePadRef.current) {
      signaturePadRef.current.clear();
      console.log("Signature effacée");
    } else if (signatureType === 'initials') {
      setInitials('');
    }
    onSignatureChange(undefined);
    toast.info("Signature effacée");
  };
  
  // Fonction améliorée pour gérer le changement de type de signature
  const handleTypeChange = (value: string) => {
    const newType = value as 'drawn' | 'initials';
    console.log("Changement de type de signature", { oldType: signatureType, newType });
    
    setSignatureType(newType);
    
    // Réinitialiser la signature actuelle
    onSignatureChange(undefined);
    
    // Si on passe aux initiales, on efface la signature dessinée
    if (newType === 'initials' && signaturePadRef.current) {
      signaturePadRef.current.clear();
      setCanvasReady(false);
    } else if (newType === 'drawn') {
      // Incrémenter le compteur pour forcer une réinitialisation complète du canvas
      setCanvasInitialized(prev => prev + 1);
    }
  };
  
  // Sauvegarde automatique quand initials ou name changent
  useEffect(() => {
    if (signatureType === 'initials' && initials.trim() && name.trim()) {
      console.log("Sauvegarde automatique des initiales:", initials);
      saveSignature();
    }
  }, [initials, name]);
  
  return (
    <div className="space-y-4">
      <Tabs value={signatureType} onValueChange={handleTypeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drawn">Signature dessinée</TabsTrigger>
          <TabsTrigger value="initials">Initiales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drawn" className="space-y-4">
          <div className="border rounded-md bg-white">
            <canvas 
              ref={canvasRef} 
              className="w-full touch-none" 
              style={{ 
                height: '200px', 
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                cursor: 'crosshair',
                touchAction: 'none'  // Ajout explicite de touchAction
              }}
              onTouchStart={(e) => e.preventDefault()}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signature-name">Nom</Label>
            <Input 
              id="signature-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet" 
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="button" onClick={clearSignature} variant="outline">Effacer</Button>
            <Button type="button" onClick={saveSignature}>Sauvegarder la signature</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="initials" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initials-input">Vos initiales</Label>
            <Input 
              id="initials-input" 
              value={initials} 
              onChange={(e) => setInitials(e.target.value)}
              placeholder="Entrez vos initiales (ex: JD)"
              maxLength={5}
              className="text-lg font-bold"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initials-name">Nom complet</Label>
            <Input 
              id="initials-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet" 
            />
          </div>
          
          {initials && (
            <div className="border p-4 rounded-md bg-gray-50 text-center">
              <div className="text-3xl font-bold font-signature my-4">{initials}</div>
              {name && <div className="text-sm text-muted-foreground">{name}</div>}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {signatureData && (
        <div className="text-sm text-muted-foreground mt-2">
          Signature {signatureData.type === 'drawn' ? 'dessinée' : 'par initiales'} 
          {signatureData.timestamp && ` le ${new Date(signatureData.timestamp).toLocaleString()}`}
        </div>
      )}

      <div className="text-xs text-muted-foreground italic">
        Dessinez votre signature à l'aide de la souris ou du doigt sur l'écran tactile
      </div>
    </div>
  );
}
