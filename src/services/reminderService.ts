
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";

const REMINDER_SCHEDULES_TABLE = 'reminder_schedules';
const REMINDER_RULES_TABLE = 'reminder_rules';

// Fonction pour récupérer toutes les planifications de rappels
export async function getReminderSchedules(): Promise<ReminderSchedule[]> {
  try {
    const { data: schedulesData, error: schedulesError } = await supabase
      .from(REMINDER_SCHEDULES_TABLE)
      .select('*');

    if (schedulesError) {
      console.error('Error fetching reminder schedules:', schedulesError);
      return [];
    }

    const schedules = [];

    for (const schedule of schedulesData || []) {
      const { data: rulesData, error: rulesError } = await supabase
        .from(REMINDER_RULES_TABLE)
        .select('*')
        .eq('schedule_id', schedule.id);

      if (rulesError) {
        console.error(`Error fetching reminder rules for schedule ${schedule.id}:`, rulesError);
        continue;
      }

      const triggers: ReminderTrigger[] = (rulesData || []).map((rule: any) => ({
        id: rule.id,
        daysBefore: rule.days_before,
        message: rule.message || '',
        enabled: rule.enabled || true,
        triggerType: rule.trigger_type || 'days_before_due',
        triggerValue: rule.trigger_value || 0,
        emailSubject: rule.email_subject || 'Rappel de facture',
        emailBody: rule.email_body || 'Ceci est un rappel pour votre facture'
      }));

      schedules.push({
        id: schedule.id,
        name: schedule.name || 'Planification de rappel',
        isDefault: schedule.is_default || false,
        enabled: schedule.enabled || true,
        triggers
      });
    }

    return schedules;
  } catch (error) {
    console.error('Error in getReminderSchedules:', error);
    return [];
  }
}

// Fonction pour enregistrer une planification de rappel
export async function saveReminderSchedule(schedule: ReminderSchedule): Promise<{ success: boolean; error?: string }> {
  try {
    const isNew = !schedule.id || schedule.id.startsWith('new-');
    const scheduleId = isNew ? uuidv4() : schedule.id;

    const scheduleData = {
      id: scheduleId,
      name: schedule.name,
      is_default: schedule.isDefault,
      enabled: schedule.enabled
    };

    // Insérer ou mettre à jour la planification
    const { error: scheduleError } = isNew
      ? await supabase.from(REMINDER_SCHEDULES_TABLE).insert(scheduleData)
      : await supabase
          .from(REMINDER_SCHEDULES_TABLE)
          .update(scheduleData)
          .eq('id', scheduleId);

    if (scheduleError) {
      console.error('Error saving reminder schedule:', scheduleError);
      return { success: false, error: scheduleError.message };
    }

    // Supprimer les anciennes règles si c'est une mise à jour
    if (!isNew) {
      const { error: deleteError } = await supabase
        .from(REMINDER_RULES_TABLE)
        .delete()
        .eq('schedule_id', scheduleId);

      if (deleteError) {
        console.error('Error deleting existing reminder rules:', deleteError);
      }
    }

    // Insérer les nouvelles règles
    for (const trigger of schedule.triggers) {
      const ruleData = {
        id: uuidv4(),
        schedule_id: scheduleId,
        days_before: trigger.daysBefore,
        message: trigger.message,
        enabled: trigger.enabled,
        trigger_type: trigger.triggerType,
        trigger_value: trigger.triggerValue,
        email_subject: trigger.emailSubject,
        email_body: trigger.emailBody
      };

      const { error: ruleError } = await supabase
        .from(REMINDER_RULES_TABLE)
        .insert(ruleData);

      if (ruleError) {
        console.error('Error saving reminder rule:', ruleError);
        return { success: false, error: ruleError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveReminderSchedule:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Fonction pour supprimer une planification de rappel
export async function deleteReminderSchedule(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Supprimer d'abord les règles associées
    const { error: rulesError } = await supabase
      .from(REMINDER_RULES_TABLE)
      .delete()
      .eq('schedule_id', id);

    if (rulesError) {
      console.error('Error deleting reminder rules:', rulesError);
      return { success: false, error: rulesError.message };
    }

    // Puis supprimer la planification
    const { error: scheduleError } = await supabase
      .from(REMINDER_SCHEDULES_TABLE)
      .delete()
      .eq('id', id);

    if (scheduleError) {
      console.error('Error deleting reminder schedule:', scheduleError);
      return { success: false, error: scheduleError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteReminderSchedule:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
