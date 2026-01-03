<script lang="ts">
	import type { Session, SessionMode } from '$lib/stores/queueStore';

	export let session: Session;
	export let onLongPress: () => void = () => {};
	export let onDoubleClick: () => void = () => {};

	const LONG_PRESS_DURATION = 1000; // milliseconds

	let pressTimer: ReturnType<typeof setTimeout> | null = null;
	let pressing = false;
	let lastClickTime = 0;

	function handleMouseDown() {
		pressing = true;
		pressTimer = setTimeout(() => {
			if (pressing && session.status === 'ACTIVE') {
				onLongPress();
			}
		}, LONG_PRESS_DURATION);
	}

	function handleMouseUp() {
		pressing = false;
		if (pressTimer) {
			clearTimeout(pressTimer);
			pressTimer = null;
		}
	}

	function handleMouseLeave() {
		handleMouseUp();
	}

	function handleClick() {
		const now = Date.now();
		if (now - lastClickTime < 300) {
			// Double click detected
			onDoubleClick();
		}
		lastClickTime = now;
	}

	function getModeColor(mode: SessionMode): string {
		switch (mode) {
			case 'SOLO':
				return 'from-purple-600 to-indigo-700';
			case 'OPEN':
				return 'from-emerald-500 to-teal-600';
			case 'GROUP':
				return 'from-pink-500 to-rose-600';
		}
	}

	function getModeLabel(mode: SessionMode): string {
		switch (mode) {
			case 'SOLO':
				return '🔒 Solo';
			case 'OPEN':
				return '🤝 Open';
			case 'GROUP':
				return '👥 Group';
		}
	}
</script>

<div
	class="relative flex flex-col items-center justify-center min-w-28 h-28 rounded-xl cursor-pointer select-none transition-all duration-300 bg-gradient-to-br {getModeColor(
		session.mode
	)} {session.status === 'ACTIVE'
		? 'shadow-lg animate-pulse-playing ring-2 ring-white ring-opacity-50'
		: 'shadow-md'} {pressing ? 'scale-95' : 'hover:scale-110'} animate-slide-in"
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mouseleave={handleMouseLeave}
	on:click={handleClick}
	on:touchstart={handleMouseDown}
	on:touchend={handleMouseUp}
	on:touchcancel={handleMouseLeave}
	role="button"
	tabindex="0"
	title={session.status === 'ACTIVE' ? 'Long press to re-queue | Double-click to edit' : 'In queue | Double-click to edit'}
>
	<!-- Player slots -->
	<div class="flex flex-wrap gap-1 justify-center mb-2">
		{#each session.playerSlots as slotId}
			<div class="px-2 py-1 text-sm font-bold text-white bg-black bg-opacity-30 rounded">
				{slotId}
			</div>
		{/each}
	</div>

	<!-- Session mode indicator -->
	<div class="absolute top-2 right-2 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
		{getModeLabel(session.mode)}
	</div>

	<!-- Capacity indicator -->
	<div class="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
		{session.playerSlots.length}/{session.capacity}
	</div>

	<!-- Active indicator -->
	{#if session.status === 'ACTIVE'}
		<div class="absolute top-2 left-2 w-3 h-3 rounded-full bg-white animate-blink"></div>
	{/if}
</div>

<style>
	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateX(-20px) scale(0.8);
		}
		to {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
	}

	@keyframes pulse-playing {
		0%,
		100% {
			box-shadow: 0 0 20px rgba(236, 72, 153, 0.6), 0 4px 6px rgba(0, 0, 0, 0.1);
		}
		50% {
			box-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 6px 10px rgba(0, 0, 0, 0.15);
		}
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	.animate-slide-in {
		animation: slide-in 0.4s ease-out;
	}

	.animate-pulse-playing {
		animation: pulse-playing 2s ease-in-out infinite;
	}

	.animate-blink {
		animation: blink 1s ease-in-out infinite;
	}
</style>
