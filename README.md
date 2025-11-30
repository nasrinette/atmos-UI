# AtmosUI

Weather and time-aware visual effects for UI elements—icons, widgets, and components—on mobile, desktop, and wearable surfaces.

**Demo:** https://nasrinette.github.io/atmos-UI/


https://github.com/user-attachments/assets/61c2abfd-0a29-42de-926a-035b48f853c4


## Concept

Instead of dynamic wallpapers, AtmosUI applies ambient effects directly to UI components. Sunny conditions produce warm glints on icons; rain creates soft rippling reflections; night brings luminescent accents. Users keep their preferred wallpaper while getting real-time environmental cues at a glance.

## Project Structure

```
├── index.html      # Main entry point
├── main.js         # Core logic and effect orchestration
├── styles.css      # UI styling
└── shaders/        # WebGL shader effects
    ├── vertex.glsl
    ├── sun.glsl
    ├── rain.glsl
    ├── ice.glsl
    ├── fog.glsl
    └── lightning.glsl
```
