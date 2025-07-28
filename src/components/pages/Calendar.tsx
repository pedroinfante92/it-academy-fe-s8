import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventInput, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../../../supabaseClient";

interface SupaUser {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export default function Calendar() {
  const [currentEvents, setCurrentEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    readEvents();
  }, []);

  const readEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("SupaCRUD")
        .select("id, first_name, last_name, created_at");

      if (error) throw error;

      const formattedEvents = (data as SupaUser[]).map((user) => {
        const onboardingDate = new Date(user.created_at);
        onboardingDate.setDate(onboardingDate.getDate() + 7);
        const dateStr = onboardingDate.toISOString().split("T")[0];

        return {
          id: user.id,
          title: `${user.first_name} ${user.last_name} Onboarding`,
          start: `${dateStr}T00:00:00`,
          end: `${dateStr}T01:00:00`,
          allDay: true,
        } satisfies EventInput;
      });

      setCurrentEvents(formattedEvents);
    } catch (err: any) {
      console.error("Error fetching events:", err.message);
    }
  };

  return (
    <div className="demo-app w-1/2">
      <div className="demo-app-main">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={false}
          dayMaxEvents={true}
          events={currentEvents}
          eventContent={renderEventContent}
          allDaySlot={true}
        />
      </div>
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
    </>
  );
}
