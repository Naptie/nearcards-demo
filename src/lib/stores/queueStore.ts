import { writable, derived, get } from "svelte/store";

// Types
export interface Machine {
  id: string;
  name: string;
  icon: string;
  seats: number; // Number of seats per game session (1 for single-player, 2+ for multi-seat)
}

export type SessionMode = "SOLO" | "OPEN" | "GROUP";
export type SessionStatus = "WAITING" | "ACTIVE" | "COMPLETED";

export interface Session {
  id: string;
  machineId: string;
  status: SessionStatus;
  mode: SessionMode;
  capacity: number;
  playerSlots: string[]; // Array of slot IDs in this session
  createdAt: number;
}

export interface PlayerInfo {
  slotId: string;
  selectedMachineIds: string[]; // Machines this player selected when joining
  sessionId: string | null; // Current session they're in
  joinedAt: number;
}

export interface Queue {
  machineId: string;
  sessions: Session[];
}

// Store for registered machines
export const machines = writable<Machine[]>([]);

// Store for all queues (one per machine)
export const queues = writable<Queue[]>([]);

// Store for player information
export const players = writable<Map<string, PlayerInfo>>(new Map());

// Store for slot occupancy tracking
export const occupiedSlots = writable<Set<string>>(new Set());

// Helper function to find the shortest queue for given machine IDs
export function findShortestQueue(machineIds: string[]): string | null {
  const allQueues = get(queues);
  let shortestId: string | null = null;
  let shortestLength = Infinity;

  for (const machineId of machineIds) {
    const queue = allQueues.find((q) => q.machineId === machineId);
    // Count total sessions in queue (each session counts as one position)
    const queueLength = queue
      ? queue.sessions.filter(
          (s) => s.status === "WAITING" || s.status === "ACTIVE"
        ).length
      : 0;

    if (queueLength < shortestLength) {
      shortestLength = queueLength;
      shortestId = machineId;
    }
  }

  return shortestId;
}

// Generate unique session ID
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Register a new machine
export function registerMachine(machine: Machine) {
  machines.update((m) => {
    if (m.find((existing) => existing.id === machine.id)) {
      return m; // Already registered
    }
    return [...m, machine];
  });

  // Initialize queue for this machine
  queues.update((q) => {
    if (q.find((existing) => existing.machineId === machine.id)) {
      return q;
    }
    return [...q, { machineId: machine.id, sessions: [] }];
  });
}

// Occupy a slot with session preferences
export function occupySlot(
  slotId: string,
  machineIds: string[],
  sessionMode: SessionMode = "SOLO",
  partnerSlotId?: string
): boolean {
  const slots = get(occupiedSlots);

  // Check if slot is already occupied
  if (slots.has(slotId)) {
    return false;
  }

  // Validate machine IDs
  if (machineIds.length === 0) {
    return false;
  }

  // Mark slot as occupied
  occupiedSlots.update((s) => {
    const newSet = new Set(s);
    newSet.add(slotId);
    if (partnerSlotId) {
      newSet.add(partnerSlotId);
    }
    return newSet;
  });

  // Find the best (shortest) queue
  const bestMachineId = findShortestQueue(machineIds);

  if (!bestMachineId) {
    return false;
  }

  const machine = get(machines).find((m) => m.id === bestMachineId);
  if (!machine) {
    return false;
  }

  // Check if we can join an existing OPEN session for multi-seat games
  let joinedExisting = false;
  if (sessionMode !== "GROUP" && machine.seats > 1) {
    queues.update((q) => {
      return q.map((queue) => {
        if (queue.machineId !== bestMachineId) {
          return queue;
        }

        // Find an OPEN session with available spots
        const openSession = queue.sessions.find(
          (s) =>
            s.status === "WAITING" &&
            s.mode === "OPEN" &&
            s.playerSlots.length < s.capacity
        );

        if (openSession && sessionMode !== "SOLO") {
          // Join the existing session
          openSession.playerSlots.push(slotId);
          // If session is now full, mark as GROUP
          if (openSession.playerSlots.length === openSession.capacity) {
            openSession.mode = "GROUP";
          }
          joinedExisting = true;
        }

        return queue;
      });
    });
  }

  // If didn't join existing, create new session
  if (!joinedExisting) {
    const newSession: Session = {
      id: generateSessionId(),
      machineId: bestMachineId,
      status: "WAITING",
      mode: sessionMode,
      capacity: machine.seats,
      playerSlots: partnerSlotId ? [slotId, partnerSlotId] : [slotId],
      createdAt: Date.now(),
    };

    queues.update((q) => {
      return q.map((queue) => {
        if (queue.machineId === bestMachineId) {
          const updatedSessions = [...queue.sessions, newSession];

          // If this is the only session, mark it as ACTIVE
          const activeCount = updatedSessions.filter(
            (s) => s.status === "ACTIVE"
          ).length;
          if (activeCount === 0 && updatedSessions.length > 0) {
            updatedSessions[0].status = "ACTIVE";
          }

          return { ...queue, sessions: updatedSessions };
        }
        return queue;
      });
    });
  }

  // Store player information
  players.update((p) => {
    const newMap = new Map(p);
    newMap.set(slotId, {
      slotId,
      selectedMachineIds: machineIds,
      sessionId: null, // Will be set when session is found
      joinedAt: Date.now(),
    });
    if (partnerSlotId) {
      newMap.set(partnerSlotId, {
        slotId: partnerSlotId,
        selectedMachineIds: machineIds,
        sessionId: null,
        joinedAt: Date.now(),
      });
    }
    return newMap;
  });

  return true;
}

// Release a slot (remove player from all sessions)
export function releaseSlot(slotId: string) {
  const slots = get(occupiedSlots);

  if (!slots.has(slotId)) {
    return;
  }

  // Remove from occupied slots
  occupiedSlots.update((s) => {
    const newSet = new Set(s);
    newSet.delete(slotId);
    return newSet;
  });

  // Remove player from sessions and promote next session if necessary
  queues.update((q) => {
    return q.map((queue) => {
      const updatedSessions = queue.sessions
        .map((session) => {
          // Remove player from this session
          const filteredSlots = session.playerSlots.filter(
            (slot) => slot !== slotId
          );

          if (filteredSlots.length !== session.playerSlots.length) {
            // Player was in this session
            if (filteredSlots.length === 0) {
              // Session is now empty, mark as COMPLETED
              return {
                ...session,
                status: "COMPLETED" as SessionStatus,
                playerSlots: [],
              };
            } else {
              // Update session with remaining players
              return { ...session, playerSlots: filteredSlots };
            }
          }
          return session;
        })
        .filter((s) => s.status !== "COMPLETED"); // Remove completed sessions

      // Ensure there's always one ACTIVE session if any exist
      const activeCount = updatedSessions.filter(
        (s) => s.status === "ACTIVE"
      ).length;
      if (activeCount === 0 && updatedSessions.length > 0) {
        updatedSessions[0].status = "ACTIVE";
      }

      return { ...queue, sessions: updatedSessions };
    });
  });

  // Remove from players map
  players.update((p) => {
    const newMap = new Map(p);
    newMap.delete(slotId);
    return newMap;
  });
}

// Move current active session to end of queue and recalculate best queue for multi-machine players
export function moveToEndOfQueue(slotId: string, currentMachineId: string) {
  const playerInfo = get(players).get(slotId);
  if (!playerInfo) {
    return;
  }

  // Find the session this player is in
  const allQueues = get(queues);
  let playerSession: Session | null = null;

  for (const queue of allQueues) {
    const session = queue.sessions.find(
      (s) =>
        s.machineId === currentMachineId &&
        s.status === "ACTIVE" &&
        s.playerSlots.includes(slotId)
    );
    if (session) {
      playerSession = session;
      break;
    }
  }

  if (!playerSession) {
    return;
  }

  // If player selected multiple machines, recalculate shortest queue
  let targetMachineId = currentMachineId;
  if (playerInfo.selectedMachineIds.length > 1) {
    const shortestQueue = findShortestQueue(playerInfo.selectedMachineIds);
    if (shortestQueue) {
      targetMachineId = shortestQueue;
    }
  }

  // Remove session from current queue and add to target queue
  queues.update((q) => {
    return q.map((queue) => {
      if (queue.machineId === currentMachineId) {
        // Remove the active session
        const filteredSessions = queue.sessions.filter(
          (s) => s.id !== playerSession!.id
        );

        // Promote next session to ACTIVE
        if (
          filteredSessions.length > 0 &&
          !filteredSessions.some((s) => s.status === "ACTIVE")
        ) {
          filteredSessions[0].status = "ACTIVE";
        }

        return { ...queue, sessions: filteredSessions };
      }
      return queue;
    });
  });

  // Add session to target queue as WAITING
  queues.update((q) => {
    return q.map((queue) => {
      if (queue.machineId === targetMachineId) {
        const reQueuedSession: Session = {
          ...playerSession!,
          machineId: targetMachineId,
          status: "WAITING",
          createdAt: Date.now(), // Update timestamp
        };

        return { ...queue, sessions: [...queue.sessions, reQueuedSession] };
      }
      return queue;
    });
  });
}

// Update session mode (for double-click edit functionality)
export function updateSessionMode(
  sessionId: string,
  machineId: string,
  newMode: SessionMode
) {
  queues.update((q) => {
    return q.map((queue) => {
      if (queue.machineId === machineId) {
        return {
          ...queue,
          sessions: queue.sessions.map((session) => {
            if (session.id === sessionId) {
              return { ...session, mode: newMode };
            }
            return session;
          }),
        };
      }
      return queue;
    });
  });
}

// Convert OPEN session to SOLO if it reaches front without a partner (timeout rule)
export function handleOpenSessionTimeout(sessionId: string, machineId: string) {
  queues.update((q) => {
    return q.map((queue) => {
      if (queue.machineId === machineId) {
        return {
          ...queue,
          sessions: queue.sessions.map((session) => {
            if (
              session.id === sessionId &&
              session.mode === "OPEN" &&
              session.playerSlots.length === 1
            ) {
              return { ...session, mode: "SOLO" };
            }
            return session;
          }),
        };
      }
      return queue;
    });
  });
}

// Derived store for queue statistics
export const queueStats = derived(queues, ($queues) => {
  return $queues.map((queue) => ({
    machineId: queue.machineId,
    totalSessions: queue.sessions.length,
    activeSessions: queue.sessions.filter((s) => s.status === "ACTIVE").length,
    waitingSessions: queue.sessions.filter((s) => s.status === "WAITING")
      .length,
    totalPlayers: queue.sessions.reduce(
      (sum, s) => sum + s.playerSlots.length,
      0
    ),
  }));
});
