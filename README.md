# NearCards Queue Management System

A self-service kiosk queue management application built with SvelteKit and Tauri v2. This system allows players to join gaming machine queues at self-service terminals.

![NearCards Queue System](https://github.com/user-attachments/assets/5b5a122b-016a-4dc3-9551-2fb618e0633a)

## Features

### 1. Machine Registration
- Register multiple gaming machines with unique IDs, names, and icons
- Each machine has its own independent queue
- Pre-configured with 4 demo machines:
  - 🎮 Switch Zone
  - 🕹️ PlayStation Station  
  - 🎯 Xbox Arena
  - 💻 PC Gaming Lab

### 2. Slot-Based Queue System
- Users scan their slot (e.g., A3, B5, C1) to join a queue
- Each slot represents a physical position in the kiosk's slot matrix
- When a slot is occupied, the system automatically adds the player to the selected machine's queue

### 3. Intelligent Queue Selection
- Players can select multiple machines when joining
- System automatically chooses the shortest queue among selected machines
- Optimizes wait times across all machines

### 4. Playing Status Management
- First player in each queue is automatically marked as "playing"
- Playing status indicated by:
  - Pink/red gradient background
  - Glowing pulsing animation
  - Blinking status indicator

### 5. Queue Rotation
- **Long press** on a playing player's slot to move them to the end of the queue
- Next player in line is automatically promoted to "playing" status
- Allows current player to continue playing after one round

### 6. Slot Release
- Players can be removed from all queues by releasing their slot
- When a playing player leaves, the next in line is automatically promoted
- System maintains queue integrity across all machines

## Visual Features

### Game-Like UI
- **Gradient backgrounds**: Rich purple/blue gradients throughout
- **Smooth animations**:
  - Slide-in animations for new players
  - Pulse effects for playing status
  - Hover effects on all interactive elements
  - Float animations for machine icons
  
### Status Colors
- **Playing (Pink/Red gradient)**: Player is currently using the machine
- **Queued (Purple gradient)**: Player is waiting in line
- **Empty (Transparent)**: No players in queue

### Responsive Design
- Scrollable queue displays for many players
- Adaptive layout for different screen sizes
- Touch-friendly interface for kiosk terminals

## Technology Stack

- **Frontend**: SvelteKit with TypeScript
- **Desktop App**: Tauri v2
- **State Management**: Svelte stores
- **Styling**: CSS with custom animations
- **Build**: Vite

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run Tauri desktop app (development)
npm run tauri dev

# Build Tauri desktop app
npm run tauri build
```

## Usage

### Adding a Player to Queue

1. Enter a slot ID in the "Slot ID" field (e.g., A3, B5, C1)
2. Select one or more machines by clicking their buttons
3. Click "Occupy Slot"
4. Player is added to the shortest queue among selected machines
5. If they're first, they're automatically marked as "playing"

![Player in Queue](https://github.com/user-attachments/assets/c2aa7653-c9f2-4a24-88c9-0d9d7c055b6f)

### Moving to End of Queue

1. Locate the playing player (pink/red card with pulsing animation)
2. **Long press** (hold for 1 second) on their slot card
3. Player moves to end of queue
4. Next player is automatically promoted to "playing"

### Removing a Player

1. Enter the slot ID in the "Slot ID" field
2. Click "Release Slot"
3. Player is removed from all queues
4. If they were playing, next player is promoted

## Architecture

### State Management (`src/lib/stores/queueStore.ts`)

The application uses Svelte stores for centralized state management:

- `machines`: Array of registered gaming machines
- `queues`: Array of queue objects, one per machine
- `occupiedSlots`: Set of currently occupied slot IDs

Key functions:
- `registerMachine()`: Add a new gaming machine
- `occupySlot()`: Add player to queue for selected machines
- `releaseSlot()`: Remove player from all queues
- `moveToEndOfQueue()`: Rotate playing player to queue end
- `findShortestQueue()`: Select optimal queue for multi-machine selection

### Components

**`PlayerSlot.svelte`**
- Displays individual player slot with status
- Handles long-press interaction for queue rotation
- Shows status-specific styling and animations

**`MachineRow.svelte`**
- Displays machine info and its queue
- Shows all players in horizontal scrollable list
- Passes long-press handler to PlayerSlot components

**`+page.svelte`**
- Main application page
- Control panel for slot operations
- Queue display section
- Handles user input and actions

## Configuration

### Tauri Configuration

The application is configured to run as a desktop app with the following settings:

- Window size: 1280x720
- Resizable: Yes
- Fullscreen mode: Available for kiosk deployment
- Dev server: http://localhost:1420
- Build output: `build/` directory

### Development

The project uses:
- TypeScript for type safety
- SvelteKit for framework
- Vite for bundling
- Tauri v2 for desktop packaging

## Deployment

### Kiosk Mode

For self-service kiosk deployment, you can modify `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [{
      "fullscreen": true,
      "decorations": false
    }]
  }
}
```

This will run the app in fullscreen without window decorations, perfect for dedicated kiosk terminals.

## Future Enhancements

Potential improvements:
- Persist queue state to database
- Add QR code scanning for slot IDs
- Implement timer-based automatic rotation
- Add sound effects for status changes
- Support for machine-specific time limits
- Analytics dashboard for queue statistics
- Multi-language support
- Admin panel for machine management

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.