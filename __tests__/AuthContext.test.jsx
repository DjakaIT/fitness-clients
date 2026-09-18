import React from "react";
import { Text } from "react-native";
import { render, screen, waitFor, act } from "@testing-library/react-native";

const mocks = {
  authCallback: null,
  snapshotCallback: null,
  snapshotErrorCallback: null,
  getDoc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  signOut: jest.fn().mockResolvedValue(undefined),
};

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth, cb) => {
    mocks.authCallback = cb;
    return jest.fn();
  },
  signOut: (...args) => mocks.signOut(...args),
}));

jest.mock("firebase/firestore", () => ({
  doc: (_db, collection, id) => ({ path: `${collection}/${id}` }),
  getDoc: (...args) => mocks.getDoc(...args),
  setDoc: (...args) => mocks.setDoc(...args),
  serverTimestamp: () => "SERVER_TS",
  onSnapshot: (_ref, onNext, onError) => {
    mocks.snapshotCallback = onNext;
    mocks.snapshotErrorCallback = onError;
    return jest.fn();
  },
}));

const { AuthProvider, useAuth } = require("../src/context/AuthContext");

function Probe() {
  const { loading, isAdmin, status, trainingType, error, isAuthenticated } =
    useAuth();
  return (
    <Text testID="state">
      {JSON.stringify({
        loading,
        isAdmin,
        status,
        trainingType,
        error,
        isAuthenticated,
      })}
    </Text>
  );
}

const state = () => JSON.parse(screen.getByTestId("state").children.join(""));

const snapshot = (data) => ({ exists: () => true, data: () => data });
const missing = { exists: () => false };

const emitUser = async (firebaseUser) => {
  await act(async () => {
    await mocks.authCallback(firebaseUser);
  });
};

const emitDoc = async (data) => {
  await act(async () => {
    mocks.snapshotCallback(snapshot(data));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mocks.getDoc.mockResolvedValue(missing);
  mocks.setDoc.mockResolvedValue(undefined);
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
});

describe("AuthProvider — session lifecycle", () => {
  it("stops loading and reports a signed-out session when there is no user", async () => {
    await emitUser(null);
    await waitFor(() => expect(state().loading).toBe(false));
    expect(state().isAuthenticated).toBe(false);
    expect(state().isAdmin).toBe(false);
  });

  it("creates a brand-new client as pending, never active", async () => {
    await emitUser({ uid: "u1", email: "client@example.com" });

    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalled());
    expect(mocks.setDoc.mock.calls[0][1]).toMatchObject({
      role: "user",
      status: "pending",
      trainingType: null,
    });
  });

  it("bootstraps the configured trainer as an active admin", async () => {
    await emitUser({ uid: "t1", email: "trainer@example.com" });

    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalled());
    expect(mocks.setDoc.mock.calls[0][1]).toMatchObject({
      role: "admin",
      status: "active",
    });
  });

  it("matches the trainer's e-mail case-insensitively", async () => {
    await emitUser({ uid: "t1", email: "Trainer@Example.COM" });

    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalled());
    expect(mocks.setDoc.mock.calls[0][1].role).toBe("admin");
  });
});

describe("AuthProvider — privilege handling", () => {
  // Regression: role used to be re-written on every login. Under the hardened
  // rules a client may not write role at all, and re-sending it would make
  // every sign-in fail.
  it("never writes role or status when the profile already exists", async () => {
    mocks.getDoc.mockResolvedValue(
      snapshot({ role: "user", status: "active" }),
    );

    await emitUser({ uid: "u1", email: "client@example.com" });

    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalled());
    const written = mocks.setDoc.mock.calls[0][1];
    expect(written).not.toHaveProperty("role");
    expect(written).not.toHaveProperty("status");
    expect(mocks.setDoc.mock.calls[0][2]).toEqual({ merge: true });
  });

  // The e-mail is bootstrap only; the stored role is the authority, and only
  // the trainer can write it.
  it("derives isAdmin from the stored role, not from the e-mail", async () => {
    mocks.getDoc.mockResolvedValue(
      snapshot({ role: "user", status: "active" }),
    );
    await emitUser({ uid: "t1", email: "trainer@example.com" });
    await emitDoc({ role: "user", status: "active" });

    expect(state().isAdmin).toBe(false);
  });

  it("does not grant admin to a client whose document claims a bogus role", async () => {
    mocks.getDoc.mockResolvedValue(
      snapshot({ role: "user", status: "active" }),
    );
    await emitUser({ uid: "u1", email: "client@example.com" });
    await emitDoc({ role: "ADMIN", status: "active" });

    expect(state().isAdmin).toBe(false);
  });

  it("grants admin when the stored role says so", async () => {
    mocks.getDoc.mockResolvedValue(
      snapshot({ role: "admin", status: "active" }),
    );
    await emitUser({ uid: "t1", email: "trainer@example.com" });
    await emitDoc({ role: "admin", status: "active" });

    expect(state().isAdmin).toBe(true);
  });

  it("propagates status and trainingType from the live document", async () => {
    mocks.getDoc.mockResolvedValue(snapshot({ role: "user" }));
    await emitUser({ uid: "u1", email: "client@example.com" });
    await emitDoc({ role: "user", status: "pending", trainingType: null });
    expect(state().status).toBe("pending");
    expect(state().trainingType).toBeNull();

    await emitDoc({
      role: "user",
      status: "active",
      trainingType: "in_person",
    });
    expect(state().status).toBe("active");
    expect(state().trainingType).toBe("in_person");
  });

  it("treats a legacy document with no status field as active", async () => {
    mocks.getDoc.mockResolvedValue(snapshot({ role: "user" }));
    await emitUser({ uid: "u1", email: "client@example.com" });
    await emitDoc({ role: "user" });

    expect(state().status).toBe("active");
  });
});

describe("AuthProvider — failure handling", () => {
  it("stops loading when the profile write fails instead of hanging", async () => {
    mocks.setDoc.mockRejectedValue(new Error("permission-denied"));

    await emitUser({ uid: "u1", email: "client@example.com" });

    await waitFor(() => expect(state().loading).toBe(false));
    expect(state().error).toBe("profile-setup-failed");
    expect(state().isAuthenticated).toBe(false);
  });

  // Regression: onSnapshot had no error handler, so a rules rejection left the
  // app on its splash spinner forever.
  it("stops loading when the profile listener errors", async () => {
    mocks.getDoc.mockResolvedValue(
      snapshot({ role: "user", status: "active" }),
    );
    await emitUser({ uid: "u1", email: "client@example.com" });

    await act(async () => {
      mocks.snapshotErrorCallback(new Error("permission-denied"));
    });

    expect(state().loading).toBe(false);
    expect(state().error).toBe("profile-unavailable");
  });

  it("clears every privilege flag on sign-out", async () => {
    mocks.getDoc.mockResolvedValue(
      snapshot({ role: "admin", status: "active" }),
    );
    await emitUser({ uid: "t1", email: "trainer@example.com" });
    await emitDoc({ role: "admin", status: "active" });
    expect(state().isAdmin).toBe(true);

    await emitUser(null);

    expect(state()).toMatchObject({
      isAdmin: false,
      isAuthenticated: false,
      status: null,
      trainingType: null,
    });
  });
});
