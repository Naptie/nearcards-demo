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
	class="player-slot {player.status}"
	class:pressing
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
	<div class="slot-id">{player.slotId}</div>
	<div class="status-indicator"></div>
</div>

<style>
	.player-slot {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		border-radius: 12px;
		margin: 0 8px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		user-select: none;
		animation: slideIn 0.4s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px) scale(0.8);
		}
		to {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
	}

	.player-slot.queued {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.player-slot.playing {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		color: white;
		box-shadow: 0 0 20px rgba(245, 87, 108, 0.6), 0 4px 6px rgba(0, 0, 0, 0.1);
		animation: pulse 2s ease-in-out infinite, slideIn 0.4s ease-out;
	}

	@keyframes pulse {
		0%, 100% {
			box-shadow: 0 0 20px rgba(245, 87, 108, 0.6), 0 4px 6px rgba(0, 0, 0, 0.1);
		}
		50% {
			box-shadow: 0 0 30px rgba(245, 87, 108, 0.8), 0 6px 10px rgba(0, 0, 0, 0.15);
		}
	}

	.player-slot.pressing {
		transform: scale(0.95);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.player-slot:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	}

	.player-slot.pressing:hover {
		transform: scale(0.95);
	}

	.slot-id {
		font-size: 24px;
		font-weight: bold;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	.status-indicator {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.8);
	}

	.playing .status-indicator {
		animation: blink 1s ease-in-out infinite;
	}

	@keyframes blink {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
</style>
