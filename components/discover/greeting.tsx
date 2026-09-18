function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Hey";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Greeting({ firstName }: { firstName: string | null }) {
  const greeting = timeOfDayGreeting();
  return (
    <div>
      <p className="font-serif text-2xl text-foreground">
        {greeting}
        {firstName ? `, ${firstName}` : ""} 👋
      </p>
      <p className="mt-1 text-lg text-muted-foreground">
        What shall we do today?
      </p>
    </div>
  );
}
