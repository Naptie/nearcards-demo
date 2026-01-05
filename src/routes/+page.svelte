<script lang="ts">
  import {
    machines,
    queues,
    registerMachine,
    occupySlot,
    releaseSlot,
    type SessionMode,
  } from "$lib/stores/queueStore";
  import { showNotification } from "$lib/stores/notificationStore";
  import MachineRow from "$lib/components/MachineRow.svelte";
  import Notifications from "$lib/components/Notifications.svelte";
  import { onMount } from "svelte";

  let slotInput = "";
  let selectedMachines: string[] = [];
  let sessionMode: SessionMode = "SOLO";
  let partnerSlotInput = "";
  let showPartnerInput = false;

  // Register demo machines on mount with multi-seat support
  onMount(() => {
    registerMachine({
      id: "machine-1",
      name: "maimai DX",
      icon: "🎵",
      seats: 2,
    });
    registerMachine({
      id: "machine-2",
      name: "CHUNITHM",
      icon: "🎹",
      seats: 2,
    });
    registerMachine({
      id: "machine-3",
      name: "Dance Rush",
      icon: "💃",
      seats: 1,
    });
    registerMachine({
      id: "machine-4",
      name: "Sound Voltex",
      icon: "🎚️",
      seats: 1,
    });
  });

  function handleOccupySlot() {
    if (!slotInput.trim()) {
      showNotification("Please enter a slot ID (e.g., A3)", "warning");
      return;
    }

    if (selectedMachines.length === 0) {
      showNotification("Please select at least one machine", "warning");
      return;
    }

    // Validate GROUP mode requires partner
    if (sessionMode === "GROUP" && !partnerSlotInput.trim()) {
      showNotification("GROUP mode requires a partner slot ID", "warning");
      return;
    }

    const partner =
      sessionMode === "GROUP"
        ? partnerSlotInput.trim().toUpperCase()
        : undefined;
    const success = occupySlot(
      slotInput.trim().toUpperCase(),
      selectedMachines,
      sessionMode,
      partner
    );

    if (success) {
      const modeLabel =
        sessionMode === "SOLO"
          ? "Solo"
          : sessionMode === "OPEN"
            ? "Open to join"
            : "Group";
      showNotification(
        `Slot ${slotInput.trim().toUpperCase()} joined queue (${modeLabel})!`,
        "success"
      );
      slotInput = "";
      partnerSlotInput = "";
      selectedMachines = [];
      showPartnerInput = false;
    } else {
      showNotification(
        `Failed to occupy slot. It may already be occupied.`,
        "error"
      );
    }
  }

  function handleReleaseSlot() {
    if (!slotInput.trim()) {
      showNotification("Please enter a slot ID to release", "warning");
      return;
    }

    releaseSlot(slotInput.trim().toUpperCase());
    showNotification(
      `Slot ${slotInput.trim().toUpperCase()} released successfully!`,
      "success"
    );
    slotInput = "";
  }

  function toggleMachine(machineId: string) {
    if (selectedMachines.includes(machineId)) {
      selectedMachines = selectedMachines.filter((id) => id !== machineId);
    } else {
      selectedMachines = [...selectedMachines, machineId];
    }
  }

  function handleSessionModeChange(mode: SessionMode) {
    sessionMode = mode;
    showPartnerInput = mode === "GROUP";
  }
</script>

<svelte:head>
  <title>NearCards Queue Management</title>
</svelte:head>

<div class="min-h-screen font-sans">
  <Notifications />

  <!-- Header -->
  <div class="navbar bg-primary text-primary-content shadow-xl">
    <div class="flex-1">
      <h1 class="text-3xl font-display ml-4">🎮 NearCards</h1>
    </div>
    <div class="flex-none">
      <span class="text-sm opacity-80">Kiosk Management System</span>
    </div>
  </div>

  <main class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Control Panel -->
    <div class="card bg-base-300 shadow-2xl mb-8">
      <div class="card-body">
        <h2 class="card-title text-3xl font-sans mb-4">Slot Control</h2>

        <!-- Slot ID Input -->
        <div class="form-control w-full max-w-md">
          <label class="label" for="slot-input">
            <span class="label-text font-semibold">Slot ID</span>
          </label>
          <input
            id="slot-input"
            type="text"
            bind:value={slotInput}
            placeholder="e.g., A3, B5, C1"
            class="input input-bordered input-primary w-full font-sans text-lg"
          />
        </div>

        <!-- Session Mode Selection -->
        <div class="form-control w-full mt-4">
          <label class="label">
            <span class="label-text font-semibold">Session Preference</span>
          </label>
          <div class="btn-group">
            <button
              class="btn {sessionMode === 'SOLO'
                ? 'btn-active btn-primary'
                : 'btn-ghost'}"
              on:click={() => handleSessionModeChange("SOLO")}
            >
              🔒 Solo
            </button>
            <button
              class="btn {sessionMode === 'OPEN'
                ? 'btn-active btn-primary'
                : 'btn-ghost'}"
              on:click={() => handleSessionModeChange("OPEN")}
            >
              🤝 Open to Join
            </button>
            <button
              class="btn {sessionMode === 'GROUP'
                ? 'btn-active btn-primary'
                : 'btn-ghost'}"
              on:click={() => handleSessionModeChange("GROUP")}
            >
              👥 Bring Friend
            </button>
          </div>
          <label class="label">
            <span class="label-text-alt">
              {#if sessionMode === "SOLO"}
                Play alone, blocking other seats
              {:else if sessionMode === "OPEN"}
                Others can join your session
              {:else}
                Play with a specific friend
              {/if}
            </span>
          </label>
        </div>

        <!-- Partner Input (for GROUP mode) -->
        {#if showPartnerInput}
          <div class="form-control w-full max-w-md mt-4">
            <label class="label" for="partner-input">
              <span class="label-text font-semibold">Partner's Slot ID</span>
            </label>
            <input
              id="partner-input"
              type="text"
              bind:value={partnerSlotInput}
              placeholder="e.g., B7"
              class="input input-bordered input-secondary w-full font-sans text-lg"
            />
          </div>
        {/if}

        <!-- Machine Selection -->
        <div class="form-control w-full mt-6">
          <label class="label">
            <span class="label-text font-semibold">Select Machine(s)</span>
          </label>
          <div class="flex flex-wrap gap-3">
            {#each $machines as machine}
              <button
                class="btn btn-lg {selectedMachines.includes(machine.id)
                  ? 'btn-primary'
                  : 'btn-outline'}"
                on:click={() => toggleMachine(machine.id)}
              >
                <span class="text-2xl mr-2">{machine.icon}</span>
                <div class="text-left">
                  <div class="font-semibold">{machine.name}</div>
                  {#if machine.seats > 1}
                    <div class="text-xs opacity-70">{machine.seats} seats</div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="card-actions justify-end mt-6">
          <button
            class="btn btn-success btn-lg gap-2"
            on:click={handleOccupySlot}
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Join Queue
          </button>
          <button
            class="btn btn-error btn-lg gap-2"
            on:click={handleReleaseSlot}
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
            Leave Queue
          </button>
        </div>
      </div>
    </div>

    <!-- Queue Display -->
    <div class="space-y-6">
      <h2 class="text-4xl font-sans font-bold">Active Queues</h2>

      {#if $machines.length === 0}
        <div class="alert shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-info flex-shrink-0 w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>No machines registered yet.</span>
          </div>
        </div>
      {:else}
        {#each $machines as machine}
          {@const queue = $queues.find((q) => q.machineId === machine.id)}
          {#if queue}
            <MachineRow {machine} {queue} />
          {/if}
        {/each}
      {/if}
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer footer-center p-4 bg-base-300 text-base-content mt-8">
    <div>
      <p class="font-sans text-sm opacity-70">
        💡 Long press on active session to re-queue | Double-click session to
        edit mode
      </p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    font-family: "Orbitron", system-ui, sans-serif;
  }

  :global(.font-display) {
    font-family: "Press Start 2P", cursive;
  }

  :global(.font-sans) {
    font-family: "Orbitron", system-ui, sans-serif;
  }
</style>
