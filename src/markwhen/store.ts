import create from "zustand";
import { EventPath, State, useLpc } from "./useLpc";
import { produce } from "immer";

type Actions = {
  requestStateUpdate: () => void;
  setHoveringPath: (path?: EventPath) => void;
  setDetailPath: (path?: EventPath) => void;
  showInEditor: (path?: EventPath) => void;
};

export const useStore = create<State & Actions>((set) => {
  const { postRequest } = useLpc({
    state: (newState) => {
      set(produce((s) => newState));
    },
  });

  const requestStateUpdate = () => postRequest("state");
  const setHoveringPath = (path?: EventPath) =>
    postRequest("setHoveringPath", path);
  const setDetailPath = (path?: EventPath) =>
    postRequest("setDetailPath", path);
  const showInEditor = (path?: EventPath) => postRequest("showInEditor", path);

  return {
    requestStateUpdate,
    setHoveringPath,
    setDetailPath,
    showInEditor,
  };
});
