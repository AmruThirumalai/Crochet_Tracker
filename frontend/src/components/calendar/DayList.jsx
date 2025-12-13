import DayRow from "./DayRow";

export default function DayList({ days }) {
  return (
    <div className="scroll-area">
      {days.map((day) => (
        <DayRow
          key={day.date}
          date={day.date}
          temp={day.temp_f}
        />
      ))}
    </div>
  );
}
