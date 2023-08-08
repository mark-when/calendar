import create from "zustand";
import { AppState, MarkwhenState, useLpc } from "@markwhen/view-client";
import { equivalentPaths, EventPath } from "@markwhen/view-client/dist/paths";
import { DateRangeIso, DateTimeGranularity } from "@markwhen/parser/lib/Types";
import { EventInput } from "@fullcalendar/core";
import { SomeNode } from "@markwhen/parser/lib/Node";
import { isEventNode, iterate } from "@markwhen/parser/lib/Noder";

export const useStore = create<{
  appState: AppState;
  markwhenState: MarkwhenState;
  requestStateUpdate: () => void;
  setHoveringPath: (path?: EventPath) => void;
  setDetailPath: (path?: EventPath) => void;
  showInEditor: (path?: EventPath) => void;
  newEvent: (dateRange: DateRangeIso, immediate: boolean) => void;
  events?: EventInput[];
}>((set) => {
  let appState: AppState = {
    isDark: false,
    colorMap: { default: {} },
  };
  let markwhenState: MarkwhenState = {
    parsed: [],
    transformed: undefined,
  };
  let events = [] as EventInput[];

  const { postRequest } = useLpc({
    appState(newState) {
      set((s) => {
        const eventColor = (node: SomeNode) => {
          const ourTags = isEventNode(node)
            ? node.value.eventDescription.tags
            : node.tags;
          return ourTags ? newState?.colorMap?.[ourTags[0]] : undefined;
        };
        let events = [] as EventInput[];
        const transformed = s?.markwhenState?.transformed;
        console.log(transformed);
        if (transformed) {
          for (const { node, path } of iterate(transformed)) {
            if (isEventNode(node)) {
              const color = eventColor(node) || "31, 32, 35";
              const hovering = equivalentPaths(newState?.hoveringPath, path);
              const detail = equivalentPaths(newState?.detailPath, path);
              const dark = newState?.isDark;
              events.push({
                id: path.join(","),
                start: node.value.dateRangeIso.fromDateTimeIso,
                end: node.value.dateRangeIso.toDateTimeIso,
                title: `${node.value.eventDescription.eventDescription}`,
                backgroundColor: `rgba(${color}, ${
                  hovering || detail ? 0.95 : 0.8
                })`,
                borderColor:
                  hovering || detail
                    ? dark
                      ? "white"
                      : "black"
                    : `rgb(${color})`,
                dateText: node.value.dateText,
              });
            }
          }
        }

        return {
          appState: newState,
          ...(transformed ? { events } : {}),
        };
      });
    },
    markwhenState: (newState) => {
      set((oldState) => {
        const eventColor = (node: SomeNode) => {
          const ourTags = isEventNode(node)
            ? node.value.eventDescription.tags
            : node.tags;
          return ourTags
            ? oldState.appState?.colorMap?.[ourTags[0]]
            : undefined;
        };

        let events = [] as EventInput[];
        const transformed = newState?.transformed;
        if (transformed) {
          for (const { node, path } of iterate(transformed)) {
            if (isEventNode(node)) {
              const color = eventColor(node) || "31, 32, 35";
              const hovering = equivalentPaths(
                oldState.appState?.hoveringPath,
                path
              );
              const detail = equivalentPaths(
                oldState.appState?.detailPath,
                path
              );
              const dark = oldState.appState?.isDark;
              events.push({
                id: path.join(","),
                start: node.value.dateRangeIso.fromDateTimeIso,
                end: node.value.dateRangeIso.toDateTimeIso,
                title: `${node.value.eventDescription.eventDescription}`,
                backgroundColor: `rgba(${color}, ${
                  hovering || detail ? 0.95 : 0.8
                })`,
                borderColor:
                  hovering || detail
                    ? dark
                      ? "white"
                      : "black"
                    : `rgb(${color})`,
                dateText: node.value.dateText,
              });
            }
          }
        }
        return {
          events,
          markwhenState: newState,
        };
      });
    },
  });

  const requestStateUpdate = () => {
    postRequest("appState");
    postRequest("markwhenState");
  };
  const setHoveringPath = (path?: EventPath) =>
    postRequest("setHoveringPath", path);
  const setDetailPath = (path?: EventPath) =>
    postRequest("setDetailPath", path);
  const showInEditor = (path?: EventPath) => postRequest("showInEditor", path);
  const newEvent = (
    range: DateRangeIso,
    immediate: boolean,
    granularity?: DateTimeGranularity
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
    appState,
    markwhenState,
    events,
  };
});

// const useStore = create<State & Actions & Events>((set) => {
//   const stateAndTransformedEvents = {
//     transformedEvents: []
//   } as State & Events;

//   const { postRequest } = useLpc({
//     state: (newState) => {
//       set(
//         produce(stateAndTransformedEvents, (s) => {
//           const eventColor = (node: SomeNode) => {
//             const ourTags = isEventNode(node)
//               ? node.value.eventDescription.tags
//               : node.tags;
//             return ourTags
//               ? newState.markwhen?.page?.parsed?.tags[ourTags[0]]
//               : undefined;
//           };

//           let events = [] as EventInput[];
//           const transformed = newState.markwhen?.page?.transformed;
//           if (transformed) {
//             for (const { node, path } of iterate(transformed)) {
//               if (isEventNode(node)) {
//                 const color = eventColor(node) || "31, 32, 35";
//                 const hovering = eqPath(
//                   newState.app?.hoveringPath?.pageFiltered?.path,
//                   path
//                 );
//                 const detail = eqPath(newState.app?.detailPath?.path, path);
//                 const dark = newState.app?.isDark;
//                 events.push({
//                   id: path.join(","),
//                   start: node.value.dateRangeIso.fromDateTimeIso,
//                   end: node.value.dateRangeIso.toDateTimeIso,
//                   title: `${node.value.eventDescription.eventDescription}`,
//                   // backgroundColor: `rgba(${color}, ${
//                   //   hovering || detail ? 0.95 : 0.8
//                   // })`,
//                   // borderColor:
//                   //   hovering || detail
//                   //     ? dark
//                   //       ? "white"
//                   //       : "black"
//                   //     : `rgb(${color})`,
//                   dateText: node.value.dateText,
//                 });
//               }
//             }
//           }
//           return { ...newState, transformedEvents: events };
//         })
//       );
//     },
