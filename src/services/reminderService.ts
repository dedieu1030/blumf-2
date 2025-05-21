
import { ReminderSchedule } from "@/types/invoice";

// Mock function to get reminder schedules
export async function getReminderSchedules(): Promise<{ success: boolean; schedules?: ReminderSchedule[]; error?: string }> {
  try {
    // In a real implementation, this would fetch from a database
    const savedSchedules = localStorage.getItem('reminderSchedules');
    if (savedSchedules) {
      return { 
        success: true, 
        schedules: JSON.parse(savedSchedules) 
      };
    }
    
    return { 
      success: true, 
      schedules: [] 
    };
  } catch (error) {
    console.error('Error getting reminder schedules:', error);
    return { 
      success: false, 
      error: 'Une erreur est survenue lors du chargement des planifications de relance' 
    };
  }
}

// Mock function to save a reminder schedule
export async function saveReminderSchedule(schedule: ReminderSchedule): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await getReminderSchedules();
    
    if (!result.success) {
      return { success: false, error: 'Erreur lors de la récupération des planifications' };
    }
    
    const schedules = result.schedules || [];
    
    const existingIndex = schedules.findIndex(s => s.id === schedule.id);
    
    if (existingIndex >= 0) {
      // Update existing schedule
      schedules[existingIndex] = schedule;
    } else {
      // Add new schedule with generated ID if not provided
      if (!schedule.id) {
        schedule.id = Date.now().toString();
      }
      schedules.push(schedule);
    }
    
    // If this is set as default, update other schedules
    if (schedule.isDefault) {
      for (let i = 0; i < schedules.length; i++) {
        if (schedules[i].id !== schedule.id) {
          schedules[i].isDefault = false;
        }
      }
    }
    
    localStorage.setItem('reminderSchedules', JSON.stringify(schedules));
    
    return { success: true };
  } catch (error) {
    console.error('Error saving reminder schedule:', error);
    return { 
      success: false, 
      error: 'Une erreur est survenue lors de l\'enregistrement de la planification' 
    };
  }
}

// Mock function to delete a reminder schedule
export async function deleteReminderSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await getReminderSchedules();
    
    if (!result.success) {
      return { success: false, error: 'Erreur lors de la récupération des planifications' };
    }
    
    const schedules = result.schedules || [];
    
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
    
    localStorage.setItem('reminderSchedules', JSON.stringify(updatedSchedules));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting reminder schedule:', error);
    return { 
      success: false, 
      error: 'Une erreur est survenue lors de la suppression de la planification' 
    };
  }
}
