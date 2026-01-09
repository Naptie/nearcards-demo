use tauri::{Manager, Emitter, State};
use serialport::SerialPort;
use std::sync::{Arc, Mutex};
use std::io::{Read, Write};
use std::time::Duration;

struct SerialState {
    port: Arc<Mutex<Option<Box<dyn SerialPort>>>>,
}

#[tauri::command]
fn send_serial(state: State<SerialState>, slot: u8, r: u8, g: u8, b: u8) -> Result<(), String> {
    // Command format: A5 5A 01 01 05 SLOT 00 R G B
    let cmd = [0xA5, 0x5A, 0x01, 0x01, 0x05, slot, 0x00, r, g, b];
    
    // Lock the mutex to access the port
    let mut lock = state.port.lock().map_err(|_| "Failed to lock mutex".to_string())?;
    
    if let Some(port) = lock.as_mut() {
        port.write_all(&cmd).map_err(|e| e.to_string())?;
        return Ok(());
    }
    
    Err("Serial port not connected".to_string())
}

fn find_subsequence(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|window| window == needle)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(SerialState { port: Arc::new(Mutex::new(None)) })
    .setup(|app| {
      let app_handle = app.handle().clone();

      let ports = serialport::available_ports().expect("No ports found!");
      for p in ports {
          println!("{}", p.port_name);
          if let serialport::SerialPortType::UsbPort(info) = p.port_type {
              println!("  Type: USB");
              println!("  VID: {:04x} PID: {:04x}", info.vid, info.pid);
              println!("  Manufacturer: {:?}", info.manufacturer);
              println!("  Product: {:?}", info.product);
          }
      }

      std::thread::spawn(move || {
          let port_name = "COM3";
          let baud_rate = 115200;

          match serialport::new(port_name, baud_rate)
              .timeout(Duration::from_millis(100))
              .open()
          {
              Ok(mut port) => {
                  println!("Opened serial port: {}", port_name);
                  
                  // Clone the port for the writer (stored in state)
                  let writer = port.try_clone().ok();
                  if let Some(w) = writer {
                       if let Ok(mut lock) = app_handle.state::<SerialState>().port.lock() {
                           *lock = Some(w);
                       }
                  }

                  // Reading loop
                  let mut serial_buf: Vec<u8> = vec![0; 1000];
                  let mut accumulated: Vec<u8> = Vec::new();
                  
                  loop {
                      match port.read(serial_buf.as_mut_slice()) {
                          Ok(t) => {
                              if t > 0 {
                                  accumulated.extend_from_slice(&serial_buf[..t]);
                                  
                                  // Process all FF FF occurrences
                                  while let Some(pos) = find_subsequence(&accumulated, &[0xFF, 0xFF]) {
                                      // Check if we have enough bytes before FF FF
                                      if pos >= 2 {
                                          let byte1 = accumulated[pos - 2]; // Slot
                                          let byte2 = accumulated[pos - 1]; // Status (00 or 01)
                                          
                                          // Emit event to frontend
                                          let _ = app_handle.emit("serial-data", serde_json::json!({
                                              "slot": byte1,
                                              "status": byte2
                                          }));
                                          
                                          // Remove the processed part including FF FF
                                          accumulated.drain(0..=pos+1);
                                      } else {
                                          // Malformed or start of stream, just remove up to FF FF
                                          accumulated.drain(0..=pos+1);
                                      }
                                  }
                              }
                          },
                          Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {
                              // Timeout is normal in non-blocking/timed mode
                              if app_handle.run_on_main_thread(|| {}).is_err() {
                                  // Application is closing
                                  break;
                              }
                          },
                          Err(e) => {
                              eprintln!("Serial read error: {:?}", e);
                              // Maybe try to reconnect or break
                              break;
                          }
                      }
                  }
              },
              Err(e) => {
                  eprintln!("Failed to open serial port {}: {}", port_name, e);
              }
          }
      });

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![send_serial])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
