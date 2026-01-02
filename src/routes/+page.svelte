<script lang="ts">
	import { machines, queues, registerMachine, occupySlot, releaseSlot } from '$lib/stores/queueStore';
	import { showNotification } from '$lib/stores/notificationStore';
	import MachineRow from '$lib/components/MachineRow.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import { onMount } from 'svelte';

	let slotInput = '';
	let selectedMachines: string[] = [];

	// Register some demo machines on mount
	onMount(() => {
		registerMachine({ id: 'machine-1', name: 'Switch Zone', icon: '🎮' });
		registerMachine({ id: 'machine-2', name: 'PlayStation Station', icon: '🕹️' });
		registerMachine({ id: 'machine-3', name: 'Xbox Arena', icon: '🎯' });
		registerMachine({ id: 'machine-4', name: 'PC Gaming Lab', icon: '💻' });
	});

	function handleOccupySlot() {
		if (!slotInput.trim()) {
			showNotification('Please enter a slot ID (e.g., A3)', 'warning');
			return;
		}

		if (selectedMachines.length === 0) {
			showNotification('Please select at least one machine', 'warning');
			return;
		}

		const success = occupySlot(slotInput.trim().toUpperCase(), selectedMachines);
		if (success) {
			showNotification(`Slot ${slotInput.trim().toUpperCase()} occupied successfully!`, 'success');
			slotInput = '';
			selectedMachines = [];
		} else {
			showNotification(`Slot ${slotInput.trim().toUpperCase()} is already occupied`, 'error');
		}
	}

	function handleReleaseSlot() {
		if (!slotInput.trim()) {
			showNotification('Please enter a slot ID to release', 'warning');
			return;
		}

		releaseSlot(slotInput.trim().toUpperCase());
		showNotification(`Slot ${slotInput.trim().toUpperCase()} released successfully!`, 'success');
		slotInput = '';
	}

	function toggleMachine(machineId: string) {
		if (selectedMachines.includes(machineId)) {
			selectedMachines = selectedMachines.filter(id => id !== machineId);
		} else {
			selectedMachines = [...selectedMachines, machineId];
		}
	}
</script>

<svelte:head>
	<title>NearCards Queue Management</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Notifications />
	
	<!-- Header with gradient -->
	<header class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
		<div class="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
			<h1 class="text-5xl font-bold text-white mb-2 flex items-center gap-3">
				<span class="text-6xl animate-bounce">🎮</span>
				NearCards Queue System
			</h1>
			<p class="text-purple-100 text-lg">Self-Service Kiosk Management</p>
		</div>
	</header>

	<main class="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
		<!-- Control Panel Card -->
		<div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
			<h2 class="text-3xl font-bold text-white mb-6">Slot Control</h2>
			
			<!-- Input Group -->
			<div class="mb-6">
				<label for="slot-input" class="block text-sm font-semibold text-gray-200 mb-2">
					Slot ID
				</label>
				<input
					id="slot-input"
					type="text"
					bind:value={slotInput}
					placeholder="e.g., A3, B5, C1"
					class="py-3 px-4 block w-full max-w-md bg-white/10 border-2 border-gray-500/30 rounded-lg text-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
				/>
			</div>

			<!-- Machine Selection -->
			<div class="mb-6">
				<span class="block text-sm font-semibold text-gray-200 mb-3">Select Machine(s)</span>
				<div class="flex flex-wrap gap-3">
					{#each $machines as machine}
						<button
							type="button"
							on:click={() => toggleMachine(machine.id)}
							class="py-3 px-6 inline-flex items-center gap-3 rounded-xl text-base font-semibold transition-all duration-200 {selectedMachines.includes(machine.id)
								? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
								: 'bg-white/10 border-2 border-gray-500/30 text-white hover:bg-white/20 hover:scale-105'}"
						>
							<span class="text-2xl">{machine.icon}</span>
							<span>{machine.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-wrap gap-3">
				<button
					type="button"
					on:click={handleOccupySlot}
					class="py-3 px-8 inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-200 shadow-lg hover:scale-105"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
					</svg>
					Occupy Slot
				</button>
				<button
					type="button"
					on:click={handleReleaseSlot}
					class="py-3 px-8 inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white text-lg font-semibold hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-200 shadow-lg hover:scale-105"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
					Release Slot
				</button>
			</div>
		</div>

		<!-- Queue Display -->
		<div class="animate-fade-in-up">
			<h2 class="text-3xl font-bold text-white mb-6">Active Queues</h2>
			
			{#if $machines.length === 0}
				<div class="bg-white/5 backdrop-blur rounded-2xl p-12 text-center border border-white/10">
					<p class="text-gray-400 text-lg">No machines registered yet.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each $machines as machine}
						{@const queue = $queues.find(q => q.machineId === machine.id)}
						{#if queue}
							<MachineRow {machine} {queue} />
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-black/30 backdrop-blur py-4 text-center">
		<p class="text-gray-400 text-sm">Long press on a playing player to move them to the end of the queue</p>
	</footer>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out;
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.7s ease-out;
	}
</style>
