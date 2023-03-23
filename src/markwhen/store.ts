import create from "zustand";
import { State, useLpc } from "@markwhen/view-client";
import { equivalentPaths, EventPath } from "@markwhen/view-client/dist/paths";
import { produce } from "immer";
import { DateRangeIso, DateTimeGranularity } from "@markwhen/parser/lib/Types";
import { EventInput } from "@fullcalendar/core";
import { SomeNode } from "@markwhen/parser/lib/Node";
import { isEventNode, iterate } from "@markwhen/parser/lib/Noder";

type Actions = {
  requestStateUpdate: () => void;
  setHoveringPath: (path?: EventPath) => void;
  setDetailPath: (path?: EventPath) => void;
  showInEditor: (path?: EventPath) => void;
  newEvent: (dateRange: DateRangeIso, immediate: boolean) => void;
};
const stateAndTransformedEvents = {};
export const useStore = create<State & Actions & { events?: EventInput[] }>(
  // @ts-ignore
  (set) => {
    const { postRequest } = useLpc({
      state: (newState) => {
        set(
          produce((s: State) => {
            const eventColor = (node: SomeNode) => {
              const ourTags = isEventNode(node)
                ? node.value.eventDescription.tags
                : node.tags;
              return ourTags
                ? newState.markwhen?.page?.parsed?.tags[ourTags[0]]
                : undefined;
            };

            let events = [] as EventInput[];
            const transformed = newState.markwhen?.page?.transformed;
            if (transformed) {
              for (const { node, path } of iterate(transformed)) {
                if (isEventNode(node)) {
                  const color = eventColor(node) || "31, 32, 35";
                  const hovering = equivalentPaths(
                    newState.app?.hoveringPath?.pageFiltered,
                    { type: "pageFiltered", path }
                  );
                  const detail = equivalentPaths(newState.app?.detailPath, {
                    type: "pageFiltered",
                    path,
                  });
                  const dark = newState.app?.isDark;
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
            return { ...newState, events };
          })
        );
      },
    });

    const requestStateUpdate = () => postRequest("state");
    const setHoveringPath = (path?: EventPath) =>
      postRequest("setHoveringPath", path);
    const setDetailPath = (path?: EventPath) =>
      postRequest("setDetailPath", path);
    const showInEditor = (path?: EventPath) =>
      postRequest("showInEditor", path);
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
    };
  }
);

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
