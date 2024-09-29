import { useStore } from "./markwhen/store";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  EventHoveringArg,
  EventClickArg,
  DateSelectArg,
  DayCellContentArg,
} from "@fullcalendar/core";
import "./App.css";
import { createRef, useEffect } from "react";
import { EventPath } from "@markwhen/view-client/dist/paths";
import { shallow, useShallow } from "zustand/shallow";
import { DateTime } from "luxon";

function App() {
  const [
    requestStateUpdate,
    setHoveringPath,
    setDetailPath,
    showInEditor,
    newEvent,
  ] = useStore(
    useShallow((s) => {
      return [
        s.requestStateUpdate,
        s.setHoveringPath,
        s.setDetailPath,
        s.showInEditor,
        s.newEvent,
      ];
    })
  );

  const dark = useStore((s) => s.appState?.isDark);
  const events = useStore((s) => s.events);

  useEffect(() => {
    // We only want an initial update, we do not want to call this on every render
    requestStateUpdate();
  }, []);

  const mouseEnter = (e: EventHoveringArg) =>
    setHoveringPath(e.event.id.split(",").map((i) => parseInt(i)));

  const mouseLeave = () => {
    setHoveringPath();
  };
  const eventClick = (e: EventClickArg) => {
    const path = e.event.id.split(",").map((i) => parseInt(i)) as EventPath;
    setDetailPath(path);
    showInEditor(path);
  };

  const select = (selection: DateSelectArg) => {
    newEvent(
      { fromDateTimeIso: selection.startStr, toDateTimeIso: selection.endStr },
      false
    );
    calendarRef.current!.getApi().unselect();
  };

  const dayCellClassNames = (dc: DayCellContentArg) => {
    const classes = [];
    const dt = DateTime.fromJSDate(dc.date);
    if (dt.day < 8) {
      if (dt.day === 1) {
        classes.push("firstDayOfMonth");
      }
      classes.push("firstWeekOfMonth");
    }
    return classes;
  };

  const calendarRef = createRef<FullCalendar>();

  return (
    <div className={`h-full w-full ${dark ? "dark" : ""}`}>
      <div
        className={`h-full w-full dark:bg-zinc-800 dark:text-zinc-100 text-zinc-900 bg-white calendar-container`}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          editable={true}
          initialView={"dayGridYear"}
          height={"100%"}
          windowResizeDelay={0}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridYear,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            year: "Month",
          }}
          events={events}
          eventMouseEnter={mouseEnter}
          eventMouseLeave={mouseLeave}
          eventClick={eventClick}
          eventClassNames={["cursor-pointer"]}
          // dateClick={dateClick}
          dayCellClassNames={dayCellClassNames}
          selectable={true}
          select={select}
        />
      </div>
    </div>
  );
}

export default App;
