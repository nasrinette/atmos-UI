# AtmosUI

Weather and time-aware visual effects for UI elements—icons, widgets, and components—on mobile, desktop, and wearable surfaces.

**Demo:** https://nasrinette.github.io/atmos-UI/

https://github.com/user-attachments/assets/61c2abfd-0a29-42de-926a-035b48f853c4

## Concept

Our concept is to let icons, widgets, and other parts of the interface react to real weather and its intensity without changing the user’s wallpaper. When it’s sunny, elements can show soft highlights; when it’s raining, they can show gentle ripple-like effects that get stronger with heavier rain; fog can add a mild hazy look; and snow can bring light shimmering touches that increase as snowfall gets heavier. These effects sit naturally on top of any background, giving users a quick sense of the weather while keeping the look they already like.

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
