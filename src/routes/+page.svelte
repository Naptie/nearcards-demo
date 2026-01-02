<script lang="ts">
	import { machines, queues, registerMachine, occupySlot, releaseSlot } from '$lib/stores/queueStore';
	import MachineRow from '$lib/components/MachineRow.svelte';
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
			alert('Please enter a slot ID (e.g., A3)');
			return;
		}

		if (selectedMachines.length === 0) {
			alert('Please select at least one machine');
			return;
		}

		occupySlot(slotInput.trim().toUpperCase(), selectedMachines);
		slotInput = '';
		selectedMachines = [];
	}

	function handleReleaseSlot() {
		if (!slotInput.trim()) {
			alert('Please enter a slot ID to release');
			return;
		}

		releaseSlot(slotInput.trim().toUpperCase());
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

<div class="app-container">
	<header class="app-header">
		<div class="header-content">
			<h1 class="app-title">🎮 NearCards Queue System</h1>
			<p class="app-subtitle">Self-Service Kiosk Management</p>
		</div>
	</header>

	<div class="content">
		<!-- Control Panel -->
		<div class="control-panel">
			<h2>Slot Control</h2>
			
			<div class="input-group">
				<label for="slot-input">Slot ID:</label>
				<input
					id="slot-input"
					type="text"
					bind:value={slotInput}
					placeholder="e.g., A3, B5, C1"
					class="slot-input"
				/>
			</div>

			<div class="machine-selection">
				<label>Select Machine(s):</label>
				<div class="machine-buttons">
					{#each $machines as machine}
						<button
							class="machine-btn"
							class:selected={selectedMachines.includes(machine.id)}
							on:click={() => toggleMachine(machine.id)}
						>
							<span class="machine-btn-icon">{machine.icon}</span>
							<span class="machine-btn-name">{machine.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="action-buttons">
				<button class="btn btn-primary" on:click={handleOccupySlot}>
					Occupy Slot
				</button>
				<button class="btn btn-danger" on:click={handleReleaseSlot}>
					Release Slot
				</button>
			</div>
		</div>

		<!-- Queue Display -->
		<div class="queue-display">
			<h2>Active Queues</h2>
			
			{#if $machines.length === 0}
				<div class="empty-state">
					<p>No machines registered yet.</p>
				</div>
			{:else}
				<div class="machines-list">
					{#each $machines as machine}
						{@const queue = $queues.find(q => q.machineId === machine.id)}
						{#if queue}
							<MachineRow {machine} {queue} />
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<footer class="app-footer">
		<p>Long press on a playing player to move them to the end of the queue</p>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
		min-height: 100vh;
		color: white;
	}

	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 32px 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		animation: slideDown 0.5s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
	}

	.app-title {
		margin: 0;
		font-size: 48px;
		font-weight: bold;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
		animation: glow 2s ease-in-out infinite;
	}

	@keyframes glow {
		0%, 100% {
			text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.3);
		}
		50% {
			text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5);
		}
	}

	.app-subtitle {
		margin: 8px 0 0 0;
		font-size: 18px;
		opacity: 0.9;
	}

	.content {
		flex: 1;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
		padding: 24px;
	}

	.control-panel {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 32px;
		backdrop-filter: blur(10px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		animation: fadeIn 0.6s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.control-panel h2 {
		margin-top: 0;
		margin-bottom: 20px;
		font-size: 28px;
	}

	.input-group {
		margin-bottom: 20px;
	}

	.input-group label {
		display: block;
		margin-bottom: 8px;
		font-size: 16px;
		font-weight: 600;
	}

	.slot-input {
		width: 100%;
		max-width: 300px;
		padding: 12px 16px;
		font-size: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		transition: all 0.3s ease;
	}

	.slot-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
	}

	.slot-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.machine-selection {
		margin-bottom: 20px;
	}

	.machine-selection label {
		display: block;
		margin-bottom: 12px;
		font-size: 16px;
		font-weight: 600;
	}

	.machine-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.machine-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 12px;
		color: white;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.machine-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.machine-btn.selected {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: #667eea;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.machine-btn-icon {
		font-size: 24px;
	}

	.action-buttons {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.btn {
		padding: 14px 32px;
		font-size: 18px;
		font-weight: 600;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
	}

	.btn:active {
		transform: translateY(0);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-danger {
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
		color: white;
	}

	.queue-display {
		animation: fadeIn 0.7s ease-out;
	}

	.queue-display h2 {
		margin-top: 0;
		margin-bottom: 24px;
		font-size: 32px;
	}

	.machines-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.empty-state {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 48px;
		text-align: center;
		font-size: 18px;
		color: rgba(255, 255, 255, 0.6);
	}

	.app-footer {
		background: rgba(0, 0, 0, 0.3);
		padding: 16px;
		text-align: center;
		color: rgba(255, 255, 255, 0.6);
		font-size: 14px;
	}
</style>
