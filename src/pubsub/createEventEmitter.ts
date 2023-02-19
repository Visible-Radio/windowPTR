export type BaseEvent<EventData, Name> = {
  stopPropagation: () => void;
  name: Name;
  data: EventData;
};

export default function createEventEmitter<EventMap>() {
  const subscribers = {} as {
    [EventName in keyof EventMap]: Set<
      (emitterEvent: BaseEvent<EventMap[EventName], EventName>) => void
    >;
  };

  const subscribe = <EventName extends keyof EventMap>(
    name: EventName,
    cb: (emitterEvent: BaseEvent<EventMap[EventName], EventName>) => void
  ) => {
    if (!subscribers[name]) {
      subscribers[name] = new Set();
    }
    subscribers[name].add(cb);

    return () => {
      subscribers[name].delete(cb);
    };
  };

  const publish = <EventName extends keyof EventMap>(
    name: EventName,
    data: EventMap[EventName]
  ) => {
    const cbs = subscribers[name];
    if (!cbs) return;
    let propagate = true;

    const event = {
      name,
      data,
      stopPropagation() {
        propagate = false;
      },
    };

    for (const cb of Array.from(cbs)) {
      if (!propagate) break;
      cb(event);
    }
  };

  return {
    subscribe,
    publish,
  };
}
