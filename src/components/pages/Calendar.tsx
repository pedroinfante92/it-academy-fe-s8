import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../../../supabaseClient";

export default function Calendar() {
  const [currentEvents, setCurrentEvents] = useState([]);

  useEffect(() => {
    readEvents();
  }, []);

  const readEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;

      const formattedEvents = data.map((dbEvent) => {
        const start = `${dbEvent.event_day}T${dbEvent.event_hour}`;
        const allDay = dbEvent.event_hour === "00:00:00";
        const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();

        return {
          id: dbEvent.id,
          title: dbEvent.event_name,
          start,
          end,
          allDay,
        };
      });

      console.log("Formatted events from DB:", formattedEvents);
      setCurrentEvents(formattedEvents);
    } catch (err) {
      console.error("Error fetching events:", err.message);
    }
  };

  const handleDateSelect = (selectInfo) => {
    const title = prompt("Please enter a new title for your event:");
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      // Add a temporary event to the calendar; the `eventAdd` handler will then save it to the DB
      calendarApi.addEvent({
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };

  const handleEventAdd = async (addInfo) => {
    const { title, startStr, allDay } = addInfo.event;
    const [event_day, timeWithOffset] = startStr.split("T");
    const event_hour = allDay ? "00:00:00" : timeWithOffset?.substring(0, 8) || "00:00:00";

    try {
      const { data, error } = await supabase.from("events").insert([
        {
          event_name: title,
          event_day,
          event_hour,
        },
      ]).select(); // Use .select() to get the inserted data, including the new id

      if (error) throw error;
      console.log("Event successfully inserted into DB:", data);
      
      // Update the event with the correct Supabase ID
      addInfo.event.setProp("id", data[0].id);
      readEvents(); // Refresh to ensure state is fully synchronized
      
    } catch (err) {
      console.error("Error adding event:", err.message);
      alert("Failed to add event.");
      addInfo.revert(); // Revert the event from the calendar if the database save fails
    }
  };

  const handleEventChange = async (changeInfo) => {
    const { id, title, start, allDay } = changeInfo.event;
    const startStr = start.toISOString();
    const [event_day, timeWithOffset] = startStr.split("T");
    const event_hour = allDay ? "00:00:00" : timeWithOffset?.substring(0, 8) || "00:00:00";
    
    try {
      const { data, error } = await supabase
        .from("events")
        .update({
          event_name: title,
          event_day,
          event_hour,
        })
        .eq("id", id);

      if (error) throw error;
      console.log("Event updated successfully:", data);

    } catch (err) {
      console.error("Error updating event:", err.message);
      changeInfo.revert();
    }
  };

  const handleEventClick = async (clickInfo) => {
    const confirmed = confirm(`Are you sure you want to delete '${clickInfo.event.title}'?`);

    if (confirmed) {
      try {
        const { data, error } = await supabase
          .from("events")
          .delete()
          .eq("id", clickInfo.event.id);

        if (error) throw error;
        console.log("Event deleted successfully:", data);
        clickInfo.event.remove();

      } catch (err) {
        console.error("Delete error:", err.message);
        alert("Failed to delete event. Please try again.");
      }
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
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={currentEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventAdd={handleEventAdd}
          eventChange={handleEventChange}
          eventContent={renderEventContent}
          allDaySlot={true}
        />
      </div>
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
    </>
  );
}