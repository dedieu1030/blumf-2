
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";
import { Plus, Trash } from "lucide-react";

interface ReminderScheduleEditorProps {
  schedule?: ReminderSchedule;
  onSave: (schedule: ReminderSchedule) => void;
  onCancel: () => void;
}

export function ReminderScheduleEditor({ schedule, onSave, onCancel }: ReminderScheduleEditorProps) {
  const [name, setName] = useState(schedule?.name || "");
  const [enabled, setEnabled] = useState(schedule?.enabled !== false);
  const [triggers, setTriggers] = useState<ReminderTrigger[]>(
    schedule?.triggers || [
      {
        id: `new-${Date.now()}`,
        triggerType: "days_before_due",
        triggerValue: 2,
        emailSubject: "Rappel de facture à venir",
        emailBody: "Votre facture arrive à échéance dans 2 jours.",
        daysBefore: 2,
        message: "Votre facture arrive à échéance dans 2 jours.",
        enabled: true
      }
    ]
  );

  const handleAddTrigger = () => {
    setTriggers([
      ...triggers,
      {
        id: `new-${Date.now()}`,
        triggerType: "days_before_due",
        triggerValue: 2,
        emailSubject: "Rappel de facture",
        emailBody: "Ceci est un rappel concernant votre facture.",
        daysBefore: 2,
        message: "Ceci est un rappel concernant votre facture.",
        enabled: true
      }
    ]);
  };

  const handleRemoveTrigger = (index: number) => {
    if (triggers.length <= 1) return; // Garder au moins un déclencheur
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const handleTriggerChange = (index: number, field: keyof ReminderTrigger, value: any) => {
    setTriggers(
      triggers.map((trigger, i) => {
        if (i === index) {
          return { ...trigger, [field]: value };
        }
        return trigger;
      })
    );
  };

  const handleSave = () => {
    const updatedSchedule: ReminderSchedule = {
      id: schedule?.id || "", // ID vide pour une nouvelle planification
      name,
      enabled,
      isDefault: schedule?.isDefault || false,
      triggers
    };

    onSave(updatedSchedule);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="col-span-2">
            <Label htmlFor="scheduleName">Nom de la planification</Label>
            <Input
              id="scheduleName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Rappels standards"
              className="mt-1"
            />
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                id="scheduleEnabled"
              />
              <Label htmlFor="scheduleEnabled">Activée</Label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-medium mb-2">Déclencheurs de rappel</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configurez quand les rappels doivent être envoyés. Vous pouvez définir plusieurs rappels dans une même planification.
          </p>

          {triggers.map((trigger, index) => (
            <div key={trigger.id} className="bg-background border border-border rounded-md p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Rappel {index + 1}</h4>
                {triggers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrigger(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Type de déclencheur</Label>
                  <Select
                    value={trigger.triggerType}
                    onValueChange={(value) =>
                      handleTriggerChange(index, "triggerType", value as any)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days_before_due">
                        Jours avant échéance
                      </SelectItem>
                      <SelectItem value="days_after_due">
                        Jours après échéance
                      </SelectItem>
                      <SelectItem value="days_after_previous_reminder">
                        Jours après le dernier rappel
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    {trigger.triggerType === "days_before_due"
                      ? "Jours avant l'échéance"
                      : trigger.triggerType === "days_after_due"
                      ? "Jours après l'échéance"
                      : "Jours après le dernier rappel"}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={trigger.triggerValue}
                    onChange={(e) =>
                      handleTriggerChange(
                        index,
                        "triggerValue",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor={`emailSubject-${index}`}>Sujet de l'email</Label>
                <Input
                  id={`emailSubject-${index}`}
                  value={trigger.emailSubject || ""}
                  onChange={(e) =>
                    handleTriggerChange(index, "emailSubject", e.target.value)
                  }
                  placeholder="Ex: Rappel de facture"
                  className="mt-1"
                />
              </div>

              <div className="mt-4">
                <Label htmlFor={`emailBody-${index}`}>Corps du message</Label>
                <Textarea
                  id={`emailBody-${index}`}
                  value={trigger.emailBody || ""}
                  onChange={(e) =>
                    handleTriggerChange(index, "emailBody", e.target.value)
                  }
                  placeholder="Contenu de l'email de rappel..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={handleAddTrigger}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un autre rappel
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
