<script lang="ts">
	import type { Machine, Queue } from '$lib/stores/queueStore';
	import { moveToEndOfQueue } from '$lib/stores/queueStore';
	import PlayerSlot from './PlayerSlot.svelte';

	export let machine: Machine;
	export let queue: Queue;
</script>

<div class="flex items-center p-6 bg-linear-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 hover:-translate-y-1 transition-all duration-300 animate-fade-in">
	<!-- Machine Info -->
	<div class="flex items-center min-w-70 pr-6 border-r border-white/20">
		<div class="w-20 h-20 flex items-center justify-center text-5xl bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg animate-float mr-4">
			{machine.icon}
		</div>
		<div class="text-white">
			<div class="text-2xl font-bold mb-1">{machine.name}</div>
			<div class="text-sm text-gray-300">
				{queue.players.length} player{queue.players.length !== 1 ? 's' : ''}
			</div>
		</div>
	</div>
	
	<!-- Queue Container -->
	<div class="flex-1 pl-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10">
		{#if queue.players.length === 0}
			<div class="text-gray-400 italic py-6 text-center">No players in queue</div>
		{:else}
			<div class="flex items-center gap-3">
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
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out;
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}

	/* Custom scrollbar styles */
	.scrollbar-thin::-webkit-scrollbar {
		height: 8px;
	}

	.scrollbar-track-white\/10::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	.scrollbar-thumb-white\/30::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
	}

	.scrollbar-thumb-white\/30::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}
</style>
