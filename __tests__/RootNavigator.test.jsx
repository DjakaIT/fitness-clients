import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";

const authState = { current: {} };

jest.mock("../src/context/AuthContext", () => ({
  useAuth: () => authState.current,
}));

const stub = (label) => () => <Text>{label}</Text>;
jest.mock("../src/navigation/AuthNavigator", () => stub("AUTH"));
jest.mock("../src/navigation/TabNavigator", () => stub("TABS"));
jest.mock("../src/navigation/AdminNavigator", () => stub("ADMIN"));
jest.mock("../src/navigation/InPersonNavigator", () => stub("IN_PERSON"));
jest.mock("../src/pages/Auth/WaitingRoom-screen", () => stub("WAITING"));

const RootNavigator = require("../src/navigation/RootNavigator").default;

const show = (state) => {
  authState.current = {
    isAuthenticated: true,
    loading: false,
    isAdmin: false,
    status: "active",
    trainingType: "online",
    ...state,
  };
  render(<RootNavigator />);
};

describe("RootNavigator", () => {
  it("sends a signed-out visitor to the auth flow", () => {
    show({ isAuthenticated: false });
    expect(screen.getByText("AUTH")).toBeTruthy();
  });

  it("sends the trainer to the admin shell regardless of status", () => {
    show({ isAdmin: true, status: undefined });
    expect(screen.getByText("ADMIN")).toBeTruthy();
  });

  it("routes an approved online client to the tabs", () => {
    show({ status: "active", trainingType: "online" });
    expect(screen.getByText("TABS")).toBeTruthy();
  });

  it("routes an approved in-person client to their own stack", () => {
    show({ status: "active", trainingType: "in_person" });
    expect(screen.getByText("IN_PERSON")).toBeTruthy();
  });

  it.each(["pending", "rejected"])(
    "holds a %s client in the waiting room",
    (s) => {
      show({ status: s });
      expect(screen.getByText("WAITING")).toBeTruthy();
    },
  );

  // Regression: the check named the blocked states, so any other value fell
  // through into the full app — where firestore.rules, which tests for
  // "active" exactly, then denied every read. "inactive" exists in production.
  it.each(["inactive", "suspended", "", null, undefined])(
    "holds a client whose status is %p, rather than showing a broken app",
    (s) => {
      show({ status: s });
      expect(screen.getByText("WAITING")).toBeTruthy();
    },
  );

  it("shows the spinner while the session is still resolving", () => {
    show({ loading: true });
    expect(screen.queryByText("TABS")).toBeNull();
    expect(screen.queryByText("AUTH")).toBeNull();
  });
});
