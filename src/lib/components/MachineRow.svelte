<script lang="ts">
	import type { Machine, Queue } from '$lib/stores/queueStore';
	import { moveToEndOfQueue } from '$lib/stores/queueStore';
	import PlayerSlot from './PlayerSlot.svelte';

	export let machine: Machine;
	export let queue: Queue;
</script>

<div class="machine-row">
	<div class="machine-info">
		<div class="machine-icon">
			{machine.icon}
		</div>
		<div class="machine-details">
			<div class="machine-name">{machine.name}</div>
			<div class="machine-stats">
				{queue.players.length} player{queue.players.length !== 1 ? 's' : ''}
			</div>
		</div>
	</div>
	
	<div class="queue-container">
		{#if queue.players.length === 0}
			<div class="empty-queue">No players in queue</div>
		{:else}
			<div class="players-list">
				{#each queue.players as player (player.slotId)}
					<PlayerSlot
						{player}
						onLongPress={() => moveToEndOfQueue(player.slotId, machine.id)}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.machine-row {
		display: flex;
		align-items: center;
		padding: 20px;
		margin: 16px 0;
		background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
		border-radius: 16px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.machine-row:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
	}

	.machine-info {
		display: flex;
		align-items: center;
		min-width: 280px;
		padding-right: 24px;
		border-right: 2px solid rgba(255, 255, 255, 0.2);
	}

	.machine-icon {
		font-size: 48px;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16px;
		margin-right: 16px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		animation: iconFloat 3s ease-in-out infinite;
	}

	@keyframes iconFloat {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.machine-details {
		color: white;
	}

	.machine-name {
		font-size: 24px;
		font-weight: bold;
		margin-bottom: 4px;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	.machine-stats {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.8);
	}

	.queue-container {
		flex: 1;
		padding-left: 24px;
		overflow-x: auto;
	}

	.players-list {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.empty-queue {
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
		padding: 24px;
		text-align: center;
	}

	/* Custom scrollbar */
	.queue-container::-webkit-scrollbar {
		height: 8px;
	}

	.queue-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	.queue-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
	}

	.queue-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}
</style>
