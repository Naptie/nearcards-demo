<script lang="ts">
	import type { Player } from '$lib/stores/queueStore';

	export let player: Player;
	export let onLongPress: () => void = () => {};

	const LONG_PRESS_DURATION = 1000; // milliseconds

	let pressTimer: ReturnType<typeof setTimeout> | null = null;
	let pressing = false;

	function handleMouseDown() {
		pressing = true;
		pressTimer = setTimeout(() => {
			if (pressing && player.status === 'playing') {
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
</script>

<div
	class="relative flex flex-col items-center justify-center w-20 h-20 rounded-xl cursor-pointer select-none transition-all duration-300 {player.status === 'playing'
		? 'bg-linear-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/50 animate-pulse-playing'
		: 'bg-linear-to-br from-purple-600 to-indigo-700 shadow-md'} {pressing ? 'scale-95' : 'hover:scale-110'} animate-slide-in"
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mouseleave={handleMouseLeave}
	on:touchstart={handleMouseDown}
	on:touchend={handleMouseUp}
	on:touchcancel={handleMouseLeave}
	role="button"
	tabindex="0"
	title={player.status === 'playing' ? 'Long press to move to end of queue' : 'In queue'}
>
	<div class="text-2xl font-bold text-white drop-shadow-lg">{player.slotId}</div>
	<div class="absolute top-2 right-2 w-3 h-3 rounded-full bg-white/80 {player.status === 'playing' ? 'animate-blink' : ''}"></div>
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
		0%, 100% {
			box-shadow: 0 0 20px rgba(236, 72, 153, 0.6), 0 4px 6px rgba(0, 0, 0, 0.1);
		}
		50% {
			box-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 6px 10px rgba(0, 0, 0, 0.15);
		}
	}

	@keyframes blink {
		0%, 100% {
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
