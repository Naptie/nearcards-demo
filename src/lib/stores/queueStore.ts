import { writable, derived, get } from 'svelte/store';

// Types
export interface Machine {
	id: string;
	name: string;
	icon: string;
}

export interface Player {
	slotId: string; // e.g., "A3"
	status: 'queued' | 'playing';
	machineId: string;
	joinedAt: number;
}

export interface Queue {
	machineId: string;
	players: Player[];
}

// Store for registered machines
export const machines = writable<Machine[]>([]);

// Store for all queues
export const queues = writable<Queue[]>([]);

// Store for slot occupancy tracking
export const occupiedSlots = writable<Set<string>>(new Set());

// Helper function to find the shortest queue for given machine IDs
export function findShortestQueue(machineIds: string[]): string | null {
	const allQueues = get(queues);
	let shortestId: string | null = null;
	let shortestLength = Infinity;

	for (const machineId of machineIds) {
		const queue = allQueues.find(q => q.machineId === machineId);
		const queueLength = queue ? queue.players.filter(p => p.status === 'queued').length : 0;
		
		if (queueLength < shortestLength) {
			shortestLength = queueLength;
			shortestId = machineId;
		}
	}

	return shortestId;
}

// Register a new machine
export function registerMachine(machine: Machine) {
	machines.update(m => {
		if (m.find(existing => existing.id === machine.id)) {
			return m; // Already registered
		}
		return [...m, machine];
	});

	// Initialize queue for this machine
	queues.update(q => {
		if (q.find(existing => existing.machineId === machine.id)) {
			return q;
		}
		return [...q, { machineId: machine.id, players: [] }];
	});
}

// Notify that a slot has been occupied
export function occupySlot(slotId: string, machineIds: string[]) {
	const slots = get(occupiedSlots);
	
	// Check if slot is already occupied
	if (slots.has(slotId)) {
		return;
	}

	// Mark slot as occupied
	occupiedSlots.update(s => {
		s.add(slotId);
		return s;
	});

	// Find the best (shortest) queue
	const bestMachineId = findShortestQueue(machineIds);
	
	if (!bestMachineId) {
		return;
	}

	// Add player to the selected queue
	queues.update(q => {
		return q.map(queue => {
			if (queue.machineId === bestMachineId) {
				const newPlayer: Player = {
					slotId,
					status: 'queued',
					machineId: bestMachineId,
					joinedAt: Date.now()
				};

				const updatedPlayers = [...queue.players, newPlayer];
				
				// If this is the only player, mark them as playing
				if (updatedPlayers.length === 1) {
					updatedPlayers[0].status = 'playing';
				}

				return { ...queue, players: updatedPlayers };
			}
			return queue;
		});
	});
}

// Release a slot (remove player from all queues)
export function releaseSlot(slotId: string) {
	const slots = get(occupiedSlots);
	
	if (!slots.has(slotId)) {
		return;
	}

	// Remove from occupied slots
	occupiedSlots.update(s => {
		s.delete(slotId);
		return s;
	});

	// Remove player from all queues and promote next player if necessary
	queues.update(q => {
		return q.map(queue => {
			const playerIndex = queue.players.findIndex(p => p.slotId === slotId);
			
			if (playerIndex === -1) {
				return queue;
			}

			const wasPlaying = queue.players[playerIndex].status === 'playing';
			const updatedPlayers = queue.players.filter(p => p.slotId !== slotId);

			// If the removed player was playing, promote the next player
			if (wasPlaying && updatedPlayers.length > 0) {
				updatedPlayers[0].status = 'playing';
			}

			return { ...queue, players: updatedPlayers };
		});
	});
}

// Move current playing player to end of queue (long press functionality)
export function moveToEndOfQueue(slotId: string, machineId: string) {
	queues.update(q => {
		return q.map(queue => {
			if (queue.machineId !== machineId) {
				return queue;
			}

			const playerIndex = queue.players.findIndex(
				p => p.slotId === slotId && p.status === 'playing'
			);

			if (playerIndex === -1 || queue.players.length <= 1) {
				return queue;
			}

			// Get the current player and mark as queued
			const currentPlayer = { ...queue.players[playerIndex], status: 'queued' as const };
			
			// Remove from current position
			const updatedPlayers = queue.players.filter((_, i) => i !== playerIndex);
			
			// Promote next player to playing
			if (updatedPlayers.length > 0) {
				updatedPlayers[0].status = 'playing';
			}
			
			// Add current player to end
			updatedPlayers.push(currentPlayer);

			return { ...queue, players: updatedPlayers };
		});
	});
}

// Derived store for queue statistics
export const queueStats = derived(queues, $queues => {
	return $queues.map(queue => ({
		machineId: queue.machineId,
		totalPlayers: queue.players.length,
		playingCount: queue.players.filter(p => p.status === 'playing').length,
		queuedCount: queue.players.filter(p => p.status === 'queued').length
	}));
});
