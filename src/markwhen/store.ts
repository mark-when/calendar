import create from "zustand";
import { EventPath, State, useLpc } from "./useLpc";
import { produce } from "immer";
import { DateRangeIso, DateTimeGranularity } from "@markwhen/parser/lib/Types";

type Actions = {
  requestStateUpdate: () => void;
  setHoveringPath: (path?: EventPath) => void;
  setDetailPath: (path?: EventPath) => void;
  showInEditor: (path?: EventPath) => void;
  newEvent: (dateRange: DateRangeIso, immediate: boolean) => void;
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
  const newEvent = (
    range: DateRangeIso,
    immediate: boolean,
    granularity?: DateTimeGranularity,
  ) =>
    postRequest("newEvent", {
      dateRangeIso: range,
      granularity,
      immediate,
    });

  return {
    requestStateUpdate,
    setHoveringPath,
    setDetailPath,
    showInEditor,
    newEvent,
  };
});
