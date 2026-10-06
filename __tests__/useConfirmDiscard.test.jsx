import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import useConfirmDiscard, {
  confirmDiscard,
} from "../src/hooks/useConfirmDiscard";

const makeNavigation = () => {
  const nav = { handler: null, dispatch: jest.fn() };
  nav.addListener = jest.fn((event, handler) => {
    nav.handler = handler;
    return jest.fn();
  });
  return nav;
};

const leaveEvent = () => ({
  preventDefault: jest.fn(),
  data: { action: { type: "GO_BACK" } },
});

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("useConfirmDiscard", () => {
  it("lets a clean screen go without asking", () => {
    const nav = makeNavigation();
    renderHook(() => useConfirmDiscard(nav, false));
    const event = leaveEvent();
    nav.handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("holds a dirty screen and leaves only after 'Odbaci'", () => {
    const nav = makeNavigation();
    renderHook(() => useConfirmDiscard(nav, true));
    const event = leaveEvent();
    nav.handler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    const buttons = Alert.alert.mock.calls[0][2];
    expect(buttons.map((b) => b.text)).toEqual(["Ostani", "Odbaci"]);
    buttons[1].onPress();
    expect(nav.dispatch).toHaveBeenCalledWith({ type: "GO_BACK" });
  });

  // After a successful save the form may still look edited for a frame;
  // the screen's own goBack must not ask.
  it("does not ask once the screen allowed leaving", () => {
    const nav = makeNavigation();
    const { result } = renderHook(() => useConfirmDiscard(nav, true));
    act(() => result.current.allowLeave());
    const event = leaveEvent();
    nav.handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

describe("confirmDiscard", () => {
  it("runs at once when nothing is unsaved", () => {
    const go = jest.fn();
    confirmDiscard(false, go);
    expect(go).toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("asks first when something is", () => {
    const go = jest.fn();
    confirmDiscard(true, go);
    expect(go).not.toHaveBeenCalled();
    Alert.alert.mock.calls[0][2][1].onPress();
    expect(go).toHaveBeenCalled();
  });
});
