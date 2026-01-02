<script lang="ts">
	import { notifications } from '$lib/stores/notificationStore';
	import { fly } from 'svelte/transition';
</script>

<div class="notification-container">
	{#each $notifications as notification (notification.id)}
		<div
			class="notification notification-{notification.type}"
			transition:fly={{ y: -20, duration: 300 }}
		>
			<div class="notification-content">
				{notification.message}
			</div>
		</div>
	{/each}
</div>

<style>
	.notification-container {
		position: fixed;
		top: 24px;
		right: 24px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 400px;
	}

	.notification {
		padding: 16px 24px;
		border-radius: 12px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.notification-info {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
		color: white;
	}

	.notification-success {
		background: linear-gradient(135deg, rgba(52, 211, 153, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%);
		color: white;
	}

	.notification-warning {
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%);
		color: white;
	}

	.notification-error {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
		color: white;
	}

	.notification-content {
		font-size: 16px;
		font-weight: 500;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
	}
</style>
