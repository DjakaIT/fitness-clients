import React from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import PressableScale from "../src/components/PressableScale";

describe("PressableScale", () => {
  it("renders its children and stays pressable", () => {
    const onPress = jest.fn();
    render(
      <PressableScale onPress={onPress} accessibilityLabel="Rezerviraj">
        <Text>Rezerviraj</Text>
      </PressableScale>,
    );

    fireEvent.press(screen.getByLabelText("Rezerviraj"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // Feedback belongs on the press, not on the release — waiting for the tap to
  // complete is what makes a control feel dead.
  it("forwards the press-in event as it happens, not on release", () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    render(
      <PressableScale
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityLabel="Chip"
      >
        <Text>Chip</Text>
      </PressableScale>,
    );

    fireEvent(screen.getByLabelText("Chip"), "pressIn");
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).not.toHaveBeenCalled();

    fireEvent(screen.getByLabelText("Chip"), "pressOut");
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress while disabled", () => {
    const onPress = jest.fn();
    render(
      <PressableScale onPress={onPress} disabled accessibilityLabel="Zauzeto">
        <Text>Zauzeto</Text>
      </PressableScale>,
    );

    fireEvent.press(screen.getByLabelText("Zauzeto"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("reports its disabled state to assistive technology", () => {
    render(
      <PressableScale disabled accessibilityLabel="Zauzeto">
        <Text>Zauzeto</Text>
      </PressableScale>,
    );

    expect(screen.getByLabelText("Zauzeto")).toBeDisabled();
  });

  // A chip for a slot somebody else already took must give no feedback at all:
  // a control that animates but does nothing reads as broken rather than as
  // unavailable.
  it("gives no press feedback at all while disabled", () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    render(
      <PressableScale
        disabled
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityLabel="Chip"
      >
        <Text>Chip</Text>
      </PressableScale>,
    );

    fireEvent(screen.getByLabelText("Chip"), "pressIn");
    fireEvent(screen.getByLabelText("Chip"), "pressOut");
    expect(onPressIn).not.toHaveBeenCalled();
    expect(onPressOut).not.toHaveBeenCalled();
  });
});
