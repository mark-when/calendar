import { useStore } from "./markwhen/store";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  EventInput,
  EventHoveringArg,
  EventClickArg,
} from "@fullcalendar/core";
import { iterate, isEventNode } from "@markwhen/parser/lib/Noder";
import type { SomeNode } from "@markwhen/parser/lib/Node";
import "./App.css";
import { Fragment, useEffect } from "react";
import { toInnerHtml } from "./markwhen/utils";
import { EventPath } from "./markwhen/useLpc";

const eqPath = (p1?: number[], p2?: number[]) =>
  !!p1 && p2 && p1.join(",") === p2.join(",");

function App() {
  const [
    events,
    dark,
    requestStateUpdate,
    setHoveringPath,
    setDetailPath,
    showInEditor,
  ] = useStore((s) => {
    const eventColor = (node: SomeNode) => {
      const ourTags = isEventNode(node)
        ? node.value.eventDescription.tags
        : node.tags;
      return ourTags ? s.markwhen?.page?.parsed?.tags[ourTags[0]] : undefined;
    };

    let events = [] as EventInput[];
    const transformed = s.markwhen?.page?.transformed;
    if (transformed) {
      for (const { node, path } of iterate(transformed)) {
        if (isEventNode(node)) {
          const color = eventColor(node) || "31, 32, 35";
          const hovering = eqPath(
            s.app?.hoveringPath?.pageFiltered?.path,
            path
          );
          const detail = eqPath(s.app?.detailPath?.path, path);
          const dark = s.app?.isDark;
          events.push({
            id: path.join(","),
            start: node.value.dateRangeIso.fromDateTimeIso,
            end: node.value.dateRangeIso.toDateTimeIso,
            title: `${node.value.eventDescription.eventDescription}`,
            backgroundColor: `rgba(${color}, ${
              hovering || detail ? 0.95 : 0.8
            })`,
            borderColor:
              hovering || detail ? (dark ? "white" : "black") : `rgb(${color})`,
            dateText: node.value.dateText,
          });
        }
      }
    }
    return [
      events,
      s.app?.isDark,
      s.requestStateUpdate,
      s.setHoveringPath,
      s.setDetailPath,
      s.showInEditor,
    ];
  });

  useEffect(() => {
    // We only want an initial update, we do not want to call this on every render
    requestStateUpdate();
  }, []);

  const mouseEnter = (e: EventHoveringArg) =>
    setHoveringPath({
      type: "pageFiltered",
      path: e.event.id.split(",").map((i) => parseInt(i)),
    });

  const mouseLeave = () => {
    setHoveringPath();
  };
  const eventClick = (e: EventClickArg) => {
    const path = {
      type: "pageFiltered",
      path: e.event.id.split(",").map((i) => parseInt(i)),
    } as EventPath;
    setDetailPath(path);
    showInEditor(path);
  };

  // const dateClick = (e) => {
  //   console.log(e);
  // };

  // const select = (e) => {
  //   console.log(e);
  // };

  return (
    <div className={`h-full w-full ${dark ? "dark" : ""}`}>
      <div
        className={`h-full w-full dark:bg-slate-800 dark:text-slate-100 text-slate-900 bg-slate-50 calendar-container`}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          editable={true}
          initialView={"dayGridMonth"}
          height={"100%"}
          windowResizeDelay={0}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventMouseEnter={mouseEnter}
          eventMouseLeave={mouseLeave}
          eventClick={eventClick}
          eventClassNames={"cursor-pointer"}
          // dateClick={dateClick}
          // selectable={true}
        />
      </div>
    </div>
  );
}

export default App;
