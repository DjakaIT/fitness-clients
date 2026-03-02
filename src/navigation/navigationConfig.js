export const sharedScreenOptions = {
  headerShown: false,
  animation: "fade_from_bottom", // smooth slide-up with fade
  animationDuration: 300,
  gestureEnabled: true,
  gestureDirection: "horizontal",
};

// For modal-style screens (if needed)
export const modalScreenOptions = {
  ...sharedScreenOptions,
  animation: "slide_from_bottom",
  presentation: "modal",
};
