import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { occupySlot, releaseSlot, occupiedSlots } from '$lib/stores/queueStore';
import { get } from 'svelte/store';

// Helper to calculate Slot ID from byte (0-9 -> A1-B5)
function getSlotId(byte: number): string | null {
  if (byte < 0 || byte > 9) return null; // Assuming 10 slots
  const row = String.fromCharCode(65 + Math.floor(byte / 5)); // A or B
  const col = (byte % 5) + 1;
  return `${row}${col}`;
}

export async function initSerialListener() {
  console.log("Initializing Serial Listener...");
  try {
    await listen('serial-data', (event: any) => {
      console.log('Serial Event:', event);
      const { slot, status } = event.payload as { slot: number, status: number };
      const slotId = getSlotId(slot);

      if (!slotId) {
          console.warn(`Unknown slot index: ${slot}`);
          return;
      }

      const isOccupied = get(occupiedSlots).has(slotId);

      if (status === 1) {
        // Occupy
        if (!isOccupied) {
            console.log(`Occupying ${slotId} via serial`);
            // Defaulting to "machine-1" (Maimai) and SOLO mode for demo
            occupySlot(slotId, ['machine-1'], 'SOLO');
            // Feedback LED: Cyan
            setSlotLed(slot, 0, 255, 255);
        }
      } else {
        // Release
        if (isOccupied) {
             console.log(`Releasing ${slotId} via serial`);
             releaseSlot(slotId);
             // Feedback LED: Off
             setSlotLed(slot, 0, 0, 0);
        }
      }
    });
  } catch (e) {
      console.error("Failed to setup serial listener", e);
  }
}

export async function setSlotLed(slot: number, r: number, g: number, b: number) {
  try {
    await invoke('send_serial', { slot, r, g, b });
  } catch (e) {
    console.error(`Failed to send serial command to slot ${slot}:`, e);
  }
}
