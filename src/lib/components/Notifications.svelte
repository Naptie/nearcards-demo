<script lang="ts">
	import { notifications } from '$lib/stores/notificationStore';
	import { fly } from 'svelte/transition';
</script>

<div class="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-md">
	{#each $notifications as notification (notification.id)}
		<div
			class="px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border {notification.type === 'success'
				? 'bg-gradient-to-r from-emerald-500/90 to-green-500/90 border-emerald-400/50'
				: notification.type === 'error'
				? 'bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-400/50'
				: notification.type === 'warning'
				? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-400/50'
				: 'bg-gradient-to-r from-indigo-500/90 to-purple-500/90 border-indigo-400/50'}"
			transition:fly={{ y: -20, duration: 300 }}
		>
			<div class="flex items-center gap-3">
				{#if notification.type === 'success'}
					<svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
				{:else if notification.type === 'error'}
					<svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				{:else if notification.type === 'warning'}
					<svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
					</svg>
				{:else}
					<svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				{/if}
				<p class="text-white font-medium text-base">{notification.message}</p>
			</div>
		</div>
	{/each}
</div>
